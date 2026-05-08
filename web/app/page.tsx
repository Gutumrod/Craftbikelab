import { legacyEditfooterPath, readLegacyHtml, routeLegacyLinks } from "@/app/legacy-html";

export default function Page() {
  const legacyHtml = readLegacyHtml(legacyEditfooterPath("index.html"));
  const html = routeLegacyLinks(legacyHtml);

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <iframe
        title="CraftBikeLab Legacy Index"
        srcDoc={html}
        className="h-full w-full border-0"
      />
    </main>
  );
}
