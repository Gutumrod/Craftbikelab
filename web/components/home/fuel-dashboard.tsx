import { fuelPrices } from "@/lib/home-content";

export default function FuelDashboard() {
  return (
    <section className="reveal relative z-20 mx-auto max-w-[1440px] px-4 pt-12 md:px-6 md:pt-20">
      <div className="glow-hover rounded-xl border-t border-[#69daff]/20 bg-[#0e0e0e] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all duration-300 md:p-6">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-8">
          <div className="flex w-full items-center justify-center gap-4 border-b border-white/10 pb-4 lg:w-auto lg:justify-start lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            <div className="kinetic-gradient-primary flex h-10 w-10 flex-col items-center justify-center rounded-full text-black shadow-[0_0_15px_rgba(105,218,255,0.5)] md:h-12 md:w-12">
              <span className="material-symbols-outlined text-lg md:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_gas_station
              </span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold uppercase tracking-widest text-[#69daff] md:text-lg">
                ราคาน้ำมันวันนี้
              </h3>
              <p className="font-body text-[10px] text-white/50 md:text-xs">Real-time Thailand Updates</p>
            </div>
          </div>

          <div className="flex w-full flex-wrap justify-center gap-4 md:gap-8 lg:w-auto" id="oil-price-dashboard">
            {fuelPrices.map((item) => (
              <div key={item.label} className="flex cursor-default flex-col items-center justify-center">
                <span className="mb-1 font-headline text-[10px] uppercase tracking-[0.2em] text-white">
                  {item.label}
                </span>
                <div className="flex items-end gap-1">
                  <span className="digital-font text-xl font-black text-[#69daff] text-glow-primary md:text-3xl">
                    {item.value}
                  </span>
                  <span className="mb-1 font-label text-[10px] text-[#69daff]/60 md:text-xs">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-center text-[10px] text-white/40" id="oil-update-time">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    </section>
  );
}
