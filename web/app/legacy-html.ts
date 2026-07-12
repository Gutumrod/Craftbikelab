import fs from "node:fs";
import path from "node:path";

const legacyEditfooterRoot = path.join(process.cwd(), "legacy-html", "Editfooter");

export function readLegacyHtml(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

export function legacyEditfooterPath(fileName: string) {
  return path.join(legacyEditfooterRoot, fileName);
}

export function routeLegacyLinks(html: string) {
  const routed = html
    .replaceAll('href="index.html"', 'href="/" target="_top"')
    .replaceAll('href="News.html"', 'href="/news" target="_top"')
    .replaceAll('href="Shop.html"', 'href="/shop" target="_top"')
    .replaceAll('href="Craft.html"', 'href="/craft" target="_top"')
    .replaceAll('href="Trip.html"', 'href="/trip" target="_top"');

  return insertNewsBeforeShop(routed);
}

function insertNewsBeforeShop(html: string) {
  const newsLink =
    '<a class="font-headline tracking-tighter uppercase text-white/70 hover:text-white transition-colors" href="/news" target="_top">News</a>\n                ';
  const newsLinkMobile =
    '<a class="font-headline tracking-tighter uppercase text-white/80 hover:text-[#69daff] transition-colors py-2" href="/news" target="_top">News</a>\n                ';

  return html
    .replace(
      '<a class="font-headline tracking-tighter uppercase text-[#69daff] border-b-2 border-[#69daff] pb-1" href="/shop" target="_top">Shop</a>',
      `${newsLink}<a class="font-headline tracking-tighter uppercase text-[#69daff] border-b-2 border-[#69daff] pb-1" href="/shop" target="_top">Shop</a>`
    )
    .replace(
      '<a class="font-headline tracking-tighter uppercase text-white/70 hover:text-white transition-colors" href="/shop" target="_top">Shop</a>',
      `${newsLink}<a class="font-headline tracking-tighter uppercase text-white/70 hover:text-white transition-colors" href="/shop" target="_top">Shop</a>`
    )
    .replace(
      '<a class="font-headline tracking-tighter uppercase text-white/80 hover:text-[#69daff] transition-colors py-2" href="/shop" target="_top">Shop</a>',
      `${newsLinkMobile}<a class="font-headline tracking-tighter uppercase text-white/80 hover:text-[#69daff] transition-colors py-2" href="/shop" target="_top">Shop</a>`
    );
}
