"""Build a read-only Shop Phase 1 dry-run package.

Reads local CraftBikeLab model sources, the capture Google Sheet export, and
live Supabase aliases with the anon key. Writes review artifacts only; it does
not write to Supabase or Google Sheets.
"""

from __future__ import annotations

import csv
import json
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

import pandas as pd


REPO_ROOT = Path(__file__).resolve().parents[2]
LOCAL_DATA = Path(r"D:\CraftBikeLab\ข้อมูล")
OUT_DIR = REPO_ROOT / "docs" / "shop-phase1-dry-run"
GENERATED_DIR = OUT_DIR / "generated"
APPLY_DIR = OUT_DIR / "apply"

ALIAS_CSV = LOCAL_DATA / "motorcycle_alias_2000.csv"
THAI_DATASET_XLSX = LOCAL_DATA / "thailand_motorcycle_dataset_300.xlsx"
BIKE_DB_XLSX = LOCAL_DATA / "Bike Database.xlsx"
ENV_FILE = REPO_ROOT / ".env"

SHEET_ID = "1SxZfdrt_k8R3chlBmOX4Z-NzcPTEXcSwWMaCGFDA928"
SHEET_GID = "1730498599"
SHEET_EXPORT_URL = (
    f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export"
    f"?format=csv&gid={SHEET_GID}"
)

TARGET_EXAMPLES = ["wave", "click", "adv", "pcx", "zontes", "vespa"]


@dataclass(frozen=True)
class ModelRow:
    brand: str
    model: str
    slug: str
    category: str
    type_: str
    source: str


def read_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"')
    return env


def clean_alias(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"\s+", "", value)
    value = re.sub(r"[^a-z0-9ก-๙]", "", value)
    return value


def normalize_display(value: str, brand: str = "") -> str:
    text = str(value or "").strip()
    text = re.sub(r"\([^)]*20\d{2}[^)]*\)", "", text)
    text = re.sub(r"\b20\d{2}\b", "", text)
    if brand:
        text = re.sub(rf"^\s*{re.escape(brand)}\s+", "", text, flags=re.I)
    text = re.sub(r"\s+", " ", text).strip(" -_/")
    return text


def split_compact_model(text: str) -> str:
    # Wave110i -> Wave 110i, Click160 -> Click 160, CB300R -> CB300R.
    text = re.sub(r"(?i)^(wave)(\d+i?)$", r"\1 \2", text)
    text = re.sub(r"(?i)^(click)(\d+i?)$", r"\1 \2", text)
    text = re.sub(r"(?i)^(fino)(\d+)$", r"\1 \2", text)
    text = re.sub(r"(?i)^(mio)(\d+)$", r"\1 \2", text)
    return text


def slug_part(text: str) -> str:
    text = split_compact_model(normalize_display(text))
    text = text.lower()
    text = text.replace("+", " plus ")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text


def make_slug(brand: str, model: str) -> str:
    brand_slug = slug_part(brand)
    model_slug = slug_part(model)
    return f"{brand_slug}-{model_slug}" if brand_slug and model_slug else model_slug


def sql_quote(value: str | int | float | None) -> str:
    if value is None:
        return "null"
    text = str(value)
    if text == "":
        return "null"
    return "'" + text.replace("'", "''") + "'"


def sql_json(value: object) -> str:
    return sql_quote(json.dumps(value, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"


def parse_price(value: str) -> float | None:
    text = str(value or "")
    match = re.search(r"[\d,]+(?:\.\d+)?", text)
    if not match:
        return None
    try:
        return float(match.group(0).replace(",", ""))
    except ValueError:
        return None


def classify_category(text: str) -> str:
    low = text.lower()
    rules = [
        ("rear_rack", ["แร็คท้าย", "ตะแกรงท้าย", "rear rack", "rack"]),
        ("side_rack", ["แร็คข้าง", "กล่องข้าง", "side rack", "pannier"]),
        ("top_box", ["กล่องท้าย", "top box", "ปิ๊บหลัง"]),
        ("screen", ["windshield", "windscreen", "ชิลด์", "บังลม"]),
        ("light", ["ไฟ led", "ไฟส่อง", "ไฟหน้า", "light"]),
        ("crashbar", ["กันล้ม", "crash bar", "engine guard"]),
        ("bag", ["กระเป๋า", "bag"]),
        ("handle", ["แฮนด์", "grip", "handle"]),
        ("riding_gear", ["ถุงมือ", "เสื้อการ์ด", "กางเกงการ์ด", "รองเท้าบูท", "หมวกกันน็อค", "glove", "boot", "helmet"]),
        ("navigation", ["carplay", "navigation", "gps", "tpms", "แผนที่", "นําทาง", "นำทาง"]),
    ]
    for category, needles in rules:
        if any(needle in low for needle in needles):
            return category
    return "accessory"


def loose_text(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9ก-๙]+", " ", value)
    return f" {re.sub(r'\s+', ' ', value).strip()} "


def is_suspicious_alias(alias: str, model_slug: str = "") -> bool:
    if re.search(r"[a-z]{2,}\d{3,}\d{2,}$", alias):
        return True
    if re.search(r"20\d{2}20\d{2}", model_slug):
        return True
    return False


def is_numeric_tail_variant(alias: str, base_aliases: set[str]) -> bool:
    for base in sorted(base_aliases, key=len, reverse=True):
        if len(base) < 4 or alias == base:
            continue
        tail = alias[len(base) :]
        if alias.startswith(base) and tail.isdigit():
            return True
    return False


def has_clean_alias_shape(alias: str) -> bool:
    # Phase 1 CEO rule: keep mechanical spelling variants only. Numeric-tail
    # generated aliases are not mechanical human typos and must not be re-added.
    return bool(alias) and not is_suspicious_alias(alias)


def infer_fitment(text: str, alias_to_slug: dict[str, str]) -> list[str]:
    compact = clean_alias(text)
    loose = loose_text(text)
    hits: set[str] = set()
    for alias, slug in sorted(alias_to_slug.items(), key=lambda item: len(item[0]), reverse=True):
        if len(alias) < 3:
            continue
        if len(alias) <= 4:
            if re.search(rf"(?<![a-z0-9ก-๙]){re.escape(alias)}(?![a-z0-9ก-๙])", loose):
                hits.add(slug)
                continue
            if (any(ch.isdigit() for ch in alias) or alias in {"xadv"}) and alias in compact:
                hits.add(slug)
            continue
        if alias in compact:
            hits.add(slug)
    # X-ADV often contains the broad "adv" token. Keep the X-ADV hit unless the
    # text names a small ADV displacement explicitly.
    if "honda-xadv" in hits and not re.search(r"adv\s*-?\s*(150|160|350)", loose):
        hits.discard("honda-adv160")
        hits.discard("honda-adv350")
    return sorted(hits)


def fetch_url_text(url: str, headers: dict[str, str] | None = None) -> str:
    request = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8-sig")


def fetch_live_aliases(env: dict[str, str]) -> list[dict[str, str]]:
    url = env.get("SUPABASE_URL", "").rstrip("/")
    key = env.get("SUPABASE_KEY", "")
    if not url or not key:
        return []

    rows: list[dict[str, str]] = []
    offset = 0
    page_size = 1000
    while True:
        query = urllib.parse.urlencode(
            {
                "select": "alias,brand,model_slug",
                "order": "alias.asc",
                "limit": str(page_size),
                "offset": str(offset),
            }
        )
        raw = fetch_url_text(
            f"{url}/rest/v1/model_aliases?{query}",
            {"apikey": key, "Authorization": f"Bearer {key}"},
        )
        data = json.loads(raw)
        if not data:
            break
        rows.extend(
            {
                "alias": clean_alias(row.get("alias", "")),
                "brand": str(row.get("brand", "") or "").strip(),
                "model_slug": str(row.get("model_slug", "") or "").strip(),
            }
            for row in data
            if row.get("alias") and row.get("model_slug")
        )
        if len(data) < page_size:
            break
        offset += page_size
    return rows


def load_alias_csv() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    with ALIAS_CSV.open("r", encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            alias = clean_alias(row.get("alias", ""))
            brand = str(row.get("brand", "") or "").strip()
            model = normalize_display(row.get("model", ""), brand)
            if alias and brand and model:
                rows.append({"alias": alias, "brand": brand, "model": model})
    return rows


def load_model_xlsx() -> list[ModelRow]:
    rows: list[ModelRow] = []

    def add_frame(path: Path, sheet: str, source: str) -> None:
        df = pd.read_excel(path, sheet_name=sheet)
        for _, item in df.iterrows():
            brand = str(item.get("Brand", "") or "").strip()
            model = normalize_display(str(item.get("Model", "") or ""), brand)
            if not brand or not model or model.lower() == "nan":
                continue
            category = str(item.get("Category", "") or "").strip()
            type_ = str(item.get("Type", "") or "").strip()
            rows.append(
                ModelRow(
                    brand=brand,
                    model=model,
                    slug=make_slug(brand, model),
                    category=category,
                    type_=type_,
                    source=source,
                )
            )

    add_frame(THAI_DATASET_XLSX, "Motorcycle_Dataset", "thailand_motorcycle_dataset_300.xlsx")
    add_frame(BIKE_DB_XLSX, "ชีต1", "Bike Database.xlsx")
    return rows


def build_model_rows(
    xlsx_rows: list[ModelRow],
    alias_rows: list[dict[str, str]],
    live_aliases: list[dict[str, str]],
) -> list[ModelRow]:
    live_slug_to_brand: dict[str, str] = {}
    for row in live_aliases:
        if is_suspicious_alias(row["alias"], row["model_slug"]):
            continue
        live_slug_to_brand.setdefault(row["model_slug"], row["brand"])

    by_slug: dict[str, ModelRow] = {}
    for row in xlsx_rows:
        by_slug.setdefault(row.slug, row)

    # Alias CSV has the richest old/commuter coverage; use it to fill gaps.
    for row in alias_rows:
        slug = make_slug(row["brand"], row["model"])
        by_slug.setdefault(
            slug,
            ModelRow(
                brand=row["brand"],
                model=row["model"],
                slug=slug,
                category="",
                type_="",
                source="motorcycle_alias_2000.csv",
            ),
        )

    # Preserve live alias slugs that are not in local master files yet.
    for slug, brand in live_slug_to_brand.items():
        if slug not in by_slug:
            model = slug
            brand_slug = slug_part(brand)
            if brand_slug and model.startswith(brand_slug + "-"):
                model = model[len(brand_slug) + 1 :]
            model = " ".join(part.upper() if part in {"abs", "gt"} else part.capitalize() for part in model.split("-"))
            by_slug[slug] = ModelRow(
                brand=brand or "",
                model=model,
                slug=slug,
                category="",
                type_="",
                source="live_model_aliases",
            )

    return sorted(by_slug.values(), key=lambda r: (r.brand.lower(), r.model.lower(), r.slug))


def build_alias_patch(
    alias_rows: list[dict[str, str]],
    live_aliases: list[dict[str, str]],
) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    live_map = {row["alias"]: row for row in live_aliases}
    proposed: dict[str, dict[str, str]] = {}
    base_aliases_by_slug: dict[str, set[str]] = {}

    for row in alias_rows:
        slug = make_slug(row["brand"], row["model"])
        proposed[row["alias"]] = {
            "alias": row["alias"],
            "brand": row["brand"],
            "model_slug": live_map.get(row["alias"], {}).get("model_slug", slug),
            "proposed_slug": slug,
        }
        if has_clean_alias_shape(row["alias"]):
            base_aliases_by_slug.setdefault(slug, set()).add(row["alias"])

    additions = [
        row
        for alias, row in sorted(proposed.items())
        if alias not in live_map
        and has_clean_alias_shape(alias)
        and not is_numeric_tail_variant(alias, base_aliases_by_slug.get(row["proposed_slug"], set()))
    ]

    suspicious_live = []
    for row in live_aliases:
        alias = row["alias"]
        # Many bad generated aliases look like pcx160333541 or wave1104788259.
        if is_suspicious_alias(alias, row["model_slug"]):
            base = re.sub(r"\d{2,}$", "", alias)
            suspicious_live.append(
                {
                    "alias": alias,
                    "brand": row["brand"],
                    "model_slug": row["model_slug"],
                    "reason": f"numeric-tail; likely generated from {base}",
                }
            )

    return additions, suspicious_live


def load_sheet_products() -> list[dict[str, str]]:
    raw = fetch_url_text(SHEET_EXPORT_URL)
    reader = csv.DictReader(raw.splitlines())
    return [dict(row) for row in reader if any((v or "").strip() for v in row.values())]


def write_models_sql(rows: list[ModelRow]) -> None:
    lines = [
        "-- Dry-run only. Review before running in Supabase SQL Editor.",
        "-- Target: public.models (Brand, Model, slug, Category, Type).",
        "-- This file does not delete or update existing rows.",
        "",
        "insert into public.models (\"Brand\", \"Model\", slug, \"Category\", \"Type\")",
        "values",
    ]
    values = []
    for row in rows:
        values.append(
            "  ("
            + ", ".join(
                [
                    sql_quote(row.brand),
                    sql_quote(row.model),
                    sql_quote(row.slug),
                    sql_quote(row.category),
                    sql_quote(row.type_),
                ]
            )
            + ")"
        )
    lines.append(",\n".join(values) + ";")
    (GENERATED_DIR / "models_seed_dry_run.sql").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_models_apply_sql(rows: list[ModelRow]) -> None:
    lines = [
        "-- Apply file. Run first.",
        "-- Inserts missing model rows only; no deletes, no updates.",
        "",
        "insert into public.models (\"Brand\", \"Model\", slug, \"Category\", \"Type\")",
        "select v.\"Brand\", v.\"Model\", v.slug, v.\"Category\", v.\"Type\"",
        "from (values",
    ]
    values = []
    for row in rows:
        values.append(
            "  ("
            + ", ".join(
                [
                    sql_quote(row.brand),
                    sql_quote(row.model),
                    sql_quote(row.slug),
                    sql_quote(row.category),
                    sql_quote(row.type_),
                ]
            )
            + ")"
        )
    lines.extend(
        [
            ",\n".join(values),
            ') as v("Brand", "Model", slug, "Category", "Type")',
            "where not exists (",
            "  select 1 from public.models m where m.slug = v.slug",
            ");",
        ]
    )
    (APPLY_DIR / "models_seed_apply.sql").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_alias_sql(additions: list[dict[str, str]], suspicious: list[dict[str, str]]) -> None:
    lines = [
        "-- Dry-run only. Review before running in Supabase SQL Editor.",
        "-- Adds aliases missing from live DB. Suspicious live aliases are reported separately, not deleted here.",
        "",
    ]
    if additions:
        lines.extend(
            [
                "insert into public.model_aliases (alias, brand, model_slug)",
                "values",
            ]
        )
        values = [
            "  ("
            + ", ".join([sql_quote(row["alias"]), sql_quote(row["brand"]), sql_quote(row["model_slug"])])
            + ")"
            for row in additions
        ]
        lines.append(",\n".join(values) + "\non conflict (alias) do nothing;")
    else:
        lines.append("-- No missing aliases found.")

    (GENERATED_DIR / "model_aliases_additions_dry_run.sql").write_text(
        "\n".join(lines) + "\n", encoding="utf-8"
    )

    with (GENERATED_DIR / "suspicious_live_aliases.csv").open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["alias", "brand", "model_slug", "reason"])
        writer.writeheader()
        writer.writerows(suspicious)

    delete_lines = [
        "-- Dry-run only. Review before running in Supabase SQL Editor.",
        "-- Deletes numeric-tail/generated garbage aliases only.",
        "-- Keyed by alias + model_slug to avoid deleting an alias that was remapped intentionally.",
        "",
    ]
    if suspicious:
        delete_lines.extend(
            [
                "delete from public.model_aliases as ma",
                "using (values",
            ]
        )
        delete_values = [
            "  (" + ", ".join([sql_quote(row["alias"]), sql_quote(row["model_slug"])]) + ")"
            for row in suspicious
        ]
        delete_lines.extend(
            [
                ",\n".join(delete_values),
                ") as v(alias, model_slug)",
                "where ma.alias = v.alias",
                "  and ma.model_slug = v.model_slug;",
            ]
        )
    else:
        delete_lines.append("-- No suspicious aliases found.")
    (GENERATED_DIR / "model_aliases_delete_dry_run.sql").write_text(
        "\n".join(delete_lines) + "\n", encoding="utf-8"
    )


def write_alias_apply_sql(additions: list[dict[str, str]], suspicious: list[dict[str, str]]) -> None:
    delete_lines = [
        "-- Apply file. Run after models_seed_apply.sql.",
        "-- Deletes numeric-tail/generated garbage aliases only.",
        "-- Keyed by alias + model_slug to avoid deleting an alias that was remapped intentionally.",
        "",
    ]
    if suspicious:
        delete_lines.extend(
            [
                "delete from public.model_aliases as ma",
                "using (values",
            ]
        )
        delete_values = [
            "  (" + ", ".join([sql_quote(row["alias"]), sql_quote(row["model_slug"])]) + ")"
            for row in suspicious
        ]
        delete_lines.extend(
            [
                ",\n".join(delete_values),
                ") as v(alias, model_slug)",
                "where ma.alias = v.alias",
                "  and ma.model_slug = v.model_slug;",
            ]
        )
    else:
        delete_lines.append("-- No suspicious aliases found.")
    (APPLY_DIR / "model_aliases_delete_apply.sql").write_text(
        "\n".join(delete_lines) + "\n", encoding="utf-8"
    )

    add_lines = [
        "-- Apply file. Run after model_aliases_delete_apply.sql.",
        "-- Inserts clean mechanical aliases only; numeric-tail garbage is filtered out.",
        "",
    ]
    if additions:
        add_lines.extend(
            [
                "insert into public.model_aliases (alias, brand, model_slug)",
                "select v.alias, v.brand, v.model_slug",
                "from (values",
            ]
        )
        add_values = [
            "  (" + ", ".join([sql_quote(row["alias"]), sql_quote(row["brand"]), sql_quote(row["model_slug"])]) + ")"
            for row in additions
        ]
        add_lines.extend(
            [
                ",\n".join(add_values),
                ") as v(alias, brand, model_slug)",
                "where not exists (",
                "  select 1 from public.model_aliases ma where ma.alias = v.alias",
                ");",
            ]
        )
    else:
        add_lines.append("-- No clean alias additions found.")
    (APPLY_DIR / "model_aliases_additions_apply.sql").write_text(
        "\n".join(add_lines) + "\n", encoding="utf-8"
    )


def write_product_cleanup(products: list[dict[str, str]], alias_to_slug: dict[str, str]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for index, product in enumerate(products, start=2):
        name = product.get("name", "")
        clean_name = product.get("clean_name", "") or name
        combined = " ".join([clean_name, name, product.get("affiliate_title", "")])
        inferred_slugs = infer_fitment(combined, alias_to_slug)
        category = product.get("category", "").strip() or classify_category(combined)
        current_is_universal = (product.get("is_universal", "").strip().upper() == "TRUE")
        recommended_is_universal = current_is_universal and not inferred_slugs
        if inferred_slugs:
            recommended_is_universal = False
        rows.append(
            {
                "sheet_row": str(index),
                "clean_name": clean_name,
                "current_category": product.get("category", ""),
                "suggested_category": category,
                "current_is_universal": product.get("is_universal", ""),
                "suggested_is_universal": "TRUE" if recommended_is_universal else "FALSE",
                "suggested_model_slugs": ",".join(inferred_slugs),
                "price_min": "" if parse_price(product.get("price", "")) is None else str(parse_price(product.get("price", ""))),
                "shopee_link": product.get("shopee_link", ""),
                "original_link": product.get("original_link", ""),
            }
        )

    fieldnames = [
        "sheet_row",
        "clean_name",
        "current_category",
        "suggested_category",
        "current_is_universal",
        "suggested_is_universal",
        "suggested_model_slugs",
        "price_min",
        "shopee_link",
        "original_link",
    ]
    with (GENERATED_DIR / "product_cleanup_dry_run.csv").open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return rows


def write_product_apply_sql(products: list[dict[str, str]], cleanup_rows: list[dict[str, str]]) -> int:
    by_row = {row["sheet_row"]: row for row in cleanup_rows if row["suggested_model_slugs"]}
    product_values: list[str] = []
    mapping_values: list[str] = []

    for index, product in enumerate(products, start=2):
        cleanup = by_row.get(str(index))
        if not cleanup:
            continue
        name = cleanup["clean_name"] or product.get("name", "")
        shopee_link = product.get("shopee_link", "")
        if not name or not shopee_link:
            continue
        image_url = product.get("image_url", "")
        metadata = {
            "source": "shop-phase1-dry-run",
            "sheet_id": SHEET_ID,
            "sheet_name": "CBL_Affiliate_Pipeline",
            "sheet_row": index,
            "original_link": product.get("original_link", ""),
            "affiliate_title": product.get("affiliate_title", ""),
            "clean_name": product.get("clean_name", ""),
        }
        image_urls = [image_url] if image_url else []
        product_slug = f"shop-{index}-{slug_part(name)[:80]}".strip("-")
        product_values.append(
            "  ("
            + ", ".join(
                [
                    sql_quote(name),
                    "null",
                    sql_quote(cleanup["suggested_category"]),
                    cleanup["price_min"] or "null",
                    sql_quote("pending"),
                    sql_quote(shopee_link),
                    "null",
                    "null",
                    sql_json(image_urls),
                    sql_json(metadata),
                    "false",
                    sql_quote(product_slug),
                ]
            )
            + ")"
        )
        for model_slug in cleanup["suggested_model_slugs"].split(","):
            model_slug = model_slug.strip()
            if model_slug:
                mapping_values.append(
                    "  (" + ", ".join([sql_quote(shopee_link), sql_quote(model_slug)]) + ")"
                )

    lines = [
        "-- Apply file. Run after clean aliases are added.",
        "-- Inserts only product rows with clear inferred fitment; ambiguous rows are skipped.",
        "-- Products are inserted as status='pending' for admin review.",
        "",
    ]
    if product_values:
        lines.extend(
            [
                "insert into public.affiliate_products (",
                "  name, brand, category, price, status, shopee_link, lazada_link, tiktok_link,",
                "  image_urls, metadata, is_universal, slug",
                ")",
                "select",
                "  v.name, v.brand, v.category, v.price, v.status, v.shopee_link, v.lazada_link, v.tiktok_link,",
                "  v.image_urls, v.metadata, v.is_universal, v.slug",
                "from (values",
                ",\n".join(product_values),
                ") as v(name, brand, category, price, status, shopee_link, lazada_link, tiktok_link, image_urls, metadata, is_universal, slug)",
                "where not exists (",
                "  select 1 from public.affiliate_products p where p.shopee_link = v.shopee_link",
                ");",
                "",
            ]
        )
    else:
        lines.append("-- No product rows with clear fitment found.")

    if mapping_values:
        lines.extend(
            [
                "insert into public.product_model_mapping (product_id, model_slug)",
                "select p.id, v.model_slug",
                "from (values",
                ",\n".join(mapping_values),
                ") as v(shopee_link, model_slug)",
                "join public.affiliate_products p on p.shopee_link = v.shopee_link",
                "where not exists (",
                "  select 1",
                "  from public.product_model_mapping pm",
                "  where pm.product_id = p.id and pm.model_slug = v.model_slug",
                ");",
            ]
        )
    (APPLY_DIR / "product_seed_apply.sql").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return len(product_values)


def write_report(
    model_rows: list[ModelRow],
    alias_rows: list[dict[str, str]],
    live_aliases: list[dict[str, str]],
    alias_additions: list[dict[str, str]],
    suspicious: list[dict[str, str]],
    products: list[dict[str, str]],
    cleanup_rows: list[dict[str, str]],
) -> None:
    brand_counts = Counter(row.brand for row in model_rows)
    category_counts = Counter(row["suggested_category"] for row in cleanup_rows)
    inferred_fitment_count = sum(1 for row in cleanup_rows if row["suggested_model_slugs"])
    auto_universal_count = sum(1 for p in products if p.get("is_universal", "").strip().upper() == "TRUE")

    example_lines = []
    for key in TARGET_EXAMPLES:
        matches = [
            row
            for row in cleanup_rows
            if key in (row["clean_name"] + " " + row["suggested_model_slugs"]).lower()
        ][:8]
        example_lines.append(f"### {key}")
        if not matches:
            example_lines.append("- no product-row match in current sheet sample")
        for row in matches:
            example_lines.append(
                f"- row {row['sheet_row']}: {row['clean_name'][:90]} | "
                f"category={row['suggested_category']} | slugs={row['suggested_model_slugs'] or '-'} | "
                f"universal={row['suggested_is_universal']}"
            )
        example_lines.append("")

    report = f"""# Shop Phase 1 Dry-Run Report

Generated by `tools/shop-phase1-dry-run/build_dry_run.py`.

## Scope
- No live Supabase writes.
- No Google Sheet writes.
- Alias deletion SQL is generated for review/apply, but not executed by this script.
- Data sources are local model files, live alias read-only REST, and Google Sheet CSV export.

## Sources
- `{ALIAS_CSV}`: {len(alias_rows)} alias rows
- `{THAI_DATASET_XLSX}` + `{BIKE_DB_XLSX}`: local model master candidates
- Google Sheet `Product_Affiliate_Pipeline` / `CBL_Affiliate_Pipeline`: {len(products)} product rows
- Live Supabase `model_aliases`: {len(live_aliases)} rows read with anon key

## Generated Artifacts
- `generated/models_seed_dry_run.sql`
- `generated/model_aliases_delete_dry_run.sql`
- `generated/model_aliases_additions_dry_run.sql`
- `generated/suspicious_live_aliases.csv`
- `generated/product_cleanup_dry_run.csv`
- `apply/models_seed_apply.sql`
- `apply/model_aliases_delete_apply.sql`
- `apply/model_aliases_additions_apply.sql`
- `apply/product_seed_apply.sql`

## Model Seed Summary
- Proposed unique models: {len(model_rows)}
- Top brands: {", ".join(f"{brand}={count}" for brand, count in brand_counts.most_common(12))}

## Alias Summary
- Local alias source rows: {len(alias_rows)}
- Live aliases: {len(live_aliases)}
- Missing alias additions proposed: {len(alias_additions)}
- Suspicious live aliases flagged, not deleted: {len(suspicious)}

## Product Cleanup Summary
- Product rows scanned: {len(products)}
- Rows currently marked universal: {auto_universal_count}
- Rows where fitment was inferred from product text: {inferred_fitment_count}
- Suggested categories: {", ".join(f"{cat}={count}" for cat, count in category_counts.most_common())}

## Target Examples
{chr(10).join(example_lines)}
## Next Manual Review
1. Review whether the proposed slug style should stay brand-prefixed.
2. Spot-check `product_cleanup_dry_run.csv`, especially rows where current universal becomes false.
3. Confirm if suspicious numeric-tail aliases should be quarantined/deleted later.
4. Apply files are ready for external verification/apply; this script does not run live writes.
"""
    (OUT_DIR / "dry_run_report.md").write_text(report, encoding="utf-8")


def write_readme() -> None:
    text = """# Shop Phase 1 Dry-Run Package

This folder contains review-only artifacts for CraftBikeLab Shop Phase 1.

Run from repo root:

```powershell
python tools/shop-phase1-dry-run/build_dry_run.py
```

The script reads local model files, the public CSV export of the capture sheet,
and live `model_aliases` through the anon Supabase key. It does not write to
Supabase or Google Sheets.
"""
    (OUT_DIR / "README.md").write_text(text, encoding="utf-8")


def write_apply_readme(
    model_rows: list[ModelRow],
    alias_additions: list[dict[str, str]],
    suspicious: list[dict[str, str]],
    product_apply_count: int,
) -> None:
    text = f"""# Shop Phase 1 Apply SQL

This folder contains SQL files prepared from the dry-run package. Codex did not
run these files against live Supabase.

## Run Order
1. `models_seed_apply.sql` - insert missing `models` rows ({len(model_rows)} candidates).
2. `model_aliases_delete_apply.sql` - delete numeric-tail/generated garbage aliases ({len(suspicious)} rows, keyed by `alias` + `model_slug`).
3. `model_aliases_additions_apply.sql` - insert clean alias additions only ({len(alias_additions)} rows).
4. `product_seed_apply.sql` - insert only products with clear inferred fitment ({product_apply_count} rows) and their `product_model_mapping` rows.

## Rollback
- Before running, export or snapshot these tables: `models`, `model_aliases`,
  `affiliate_products`, `product_model_mapping`.
- If rollback is needed immediately after this apply set:
  - remove products where `metadata->>'source' = 'shop-phase1-dry-run'`;
  - remove mappings for those product IDs;
  - restore `model_aliases` from the snapshot/export if the garbage delete needs to be undone;
  - remove model rows whose `slug` appears in `models_seed_apply.sql` only if no product mapping depends on them.

## Notes
- Product rows are seeded with `status = 'pending'`.
- Ambiguous product rows are intentionally skipped.
- No slang/nickname alias expansion is included in this package.
"""
    (APPLY_DIR / "README.md").write_text(text, encoding="utf-8")


def main() -> int:
    for path in [ALIAS_CSV, THAI_DATASET_XLSX, BIKE_DB_XLSX]:
        if not path.exists():
            print(f"missing source: {path}", file=sys.stderr)
            return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    APPLY_DIR.mkdir(parents=True, exist_ok=True)

    env = read_env(ENV_FILE)
    live_aliases = fetch_live_aliases(env)
    alias_rows = load_alias_csv()
    xlsx_rows = load_model_xlsx()
    model_rows = build_model_rows(xlsx_rows, alias_rows, live_aliases)
    alias_additions, suspicious = build_alias_patch(alias_rows, live_aliases)
    products = load_sheet_products()

    alias_to_slug = {row["alias"]: row["model_slug"] for row in live_aliases}
    for row in alias_rows:
        alias_to_slug.setdefault(row["alias"], make_slug(row["brand"], row["model"]))

    write_readme()
    write_models_sql(model_rows)
    write_models_apply_sql(model_rows)
    write_alias_sql(alias_additions, suspicious)
    write_alias_apply_sql(alias_additions, suspicious)
    cleanup_rows = write_product_cleanup(products, alias_to_slug)
    product_apply_count = write_product_apply_sql(products, cleanup_rows)
    write_apply_readme(model_rows, alias_additions, suspicious, product_apply_count)
    write_report(
        model_rows,
        alias_rows,
        live_aliases,
        alias_additions,
        suspicious,
        products,
        cleanup_rows,
    )

    print(f"dry-run package written: {OUT_DIR}")
    print(f"models={len(model_rows)} products={len(products)} alias_additions={len(alias_additions)} suspicious_aliases={len(suspicious)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
