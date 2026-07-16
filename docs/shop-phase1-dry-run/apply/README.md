# Shop Phase 1 Apply SQL

This folder contains SQL files prepared from the dry-run package. Codex did not
run these files against live Supabase.

## Run Order
1. `models_seed_apply.sql` - insert missing `models` rows (472 candidates).
2. `model_aliases_delete_apply.sql` - delete numeric-tail/generated garbage aliases (925 rows, keyed by `alias` + `model_slug`).
3. `model_aliases_additions_apply.sql` - insert clean alias additions only (8 rows).
4. `product_seed_apply.sql` - insert only products with clear inferred fitment (33 rows) and their `product_model_mapping` rows.

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
