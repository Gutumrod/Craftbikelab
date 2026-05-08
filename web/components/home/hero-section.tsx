import { heroContent } from "@/lib/home-content";

export default function HeroSection() {
  return (
    <section className="reveal relative flex min-h-[80vh] items-center overflow-hidden pb-0 pt-12">
      <div className="absolute inset-0 z-0">
        <img
          className="h-full w-full object-cover grayscale opacity-40 mix-blend-lighten"
          src={heroContent.image}
          alt="Motorcycle Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-black/50 to-transparent" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-center px-4 md:px-8">
        <div className="max-w-4xl">
          <h1 className="mb-6 text-4xl font-black italic uppercase leading-[1.1] tracking-tighter text-white text-glow-primary sm:text-5xl md:text-[65px] lg:text-[70px] md:leading-[0.9]">
            WHERE CRAFT <br />
            <span className="bg-clip-text text-transparent kinetic-gradient-primary pr-6">
              MEETS THE ROAD
            </span>
          </h1>
          <p className="max-w-2xl font-body text-base font-medium tracking-wide text-on-surface-variant md:text-xl lg:text-2xl">
            {heroContent.description}
          </p>
        </div>
      </div>
    </section>
  );
}
