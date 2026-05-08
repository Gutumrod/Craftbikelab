import Link from "next/link";
import { footerLinks } from "@/lib/home-content";

function SocialIcon({ label }: { label: string }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#69daff]/10 text-[10px] font-black uppercase text-[#69daff]">
      {label.slice(0, 1)}
    </span>
  );
}

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-[#2c2c2c] bg-[#0a0a0a] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-col gap-8 md:mb-12 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="w-full flex-1 text-center lg:text-left">
            <div className="mb-3 font-headline text-2xl font-black italic uppercase tracking-tighter text-[#69daff] text-glow-primary md:text-3xl">
              CRAFTBIKELAB
            </div>
            <p className="mb-6 text-sm font-medium text-white/60 md:text-base" style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif" }}>
              นิยามใหม่ของการแต่งรถระดับพรีเมียม
            </p>

            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              {footerLinks.social.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="inline-flex items-center gap-2 text-[#69daff] transition-colors hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                >
                  <SocialIcon label={social.label} />
                </a>
              ))}
            </div>
          </div>

          <div className="w-full flex-1 text-center lg:text-left">
            <div className="mb-4 font-headline text-base font-bold uppercase tracking-[0.2em] text-[#69daff] text-glow-primary" style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif" }}>
              ติดต่อเรา
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 lg:justify-start">
                <span className="material-symbols-outlined text-lg text-[#69daff] md:text-xl">phone</span>
                <span className="font-body text-sm text-white/80 md:text-base" style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif" }}>
                  080-074-2005
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 lg:justify-start">
                <span className="material-symbols-outlined text-lg text-[#69daff] md:text-xl">email</span>
                <span className="font-body text-sm text-white/80 md:text-base" style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif" }}>
                  titazmth@gmail.com
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex-[1.5] text-center lg:text-right">
            <div className="inline-block py-4 font-headline text-2xl font-bold italic leading-tight tracking-tighter text-[#69daff] text-glow-primary md:text-3xl lg:text-4xl xl:text-5xl" style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif", textShadow: "0 0 20px rgba(105, 218, 255, 0.5)" }}>
              ถ้าชอบแต่งรถ ชอบเดินทาง
              <br className="hidden md:block" />
              <span className="mt-2 inline-block md:mt-4">เราเคียงข้างคุณ</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 md:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center text-[10px] uppercase tracking-widest text-white/40 md:text-left">
              © 2026 CRAFTBIKELAB | ALL RIGHTS RESERVED
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <div className="flex gap-4">
                {footerLinks.policy.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[10px] uppercase tracking-widest text-white/20 transition-colors hover:text-[#69daff]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 opacity-50">
                  <span className="material-symbols-outlined text-sm text-[#69daff]">verified</span>
                  <span className="text-[10px] font-headline uppercase tracking-tighter text-white">Apex Certified</span>
                </div>
                <div className="flex items-center gap-1 opacity-50">
                  <span className="material-symbols-outlined text-sm text-[#69daff]">security</span>
                  <span className="text-[10px] font-headline uppercase tracking-tighter text-white">Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
