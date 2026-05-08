import { legacyEditfooterPath, readLegacyHtml, routeLegacyLinks } from "@/app/legacy-html";

export default function TripPage() {
  const legacyHtml = readLegacyHtml(legacyEditfooterPath("Trip.html"));
  const html = routeLegacyLinks(legacyHtml);

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <iframe
        title="CraftBikeLab Legacy Trip"
        srcDoc={html}
        className="h-full w-full border-0"
      />
    </main>
  );
}
