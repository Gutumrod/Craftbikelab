import { legacyEditfooterPath, readLegacyHtml, routeLegacyLinks } from "@/app/legacy-html";

export default function AdminPage() {
  const legacyHtml = readLegacyHtml(legacyEditfooterPath("Craftbikelab-Admin.html"));
  const html = routeLegacyLinks(legacyHtml);

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <iframe
        title="CraftBikeLab Legacy Admin"
        srcDoc={html}
        className="h-full w-full border-0"
      />
    </main>
  );
}
