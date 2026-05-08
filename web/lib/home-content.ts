export type NavLink = {
  label: string;
  href: string;
};

export type FuelPrice = {
  label: string;
  value: string;
  unit: string;
};

export type StoryCard = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
};

export type NewsExtraCard = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  icon: "engineering" | "spark" | "route";
};

export type RouteCard = {
  title: string;
  region: string;
  description: string;
  image: string;
  icon: string;
};

export type ProductCard = {
  title: string;
  description: string;
  price: string;
  icon: string;
  image?: string;
};

export const navLinks: NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Craft", href: "/craft" },
  { label: "Trip", href: "/trip" },
];

export const heroContent = {
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB3_ngBBQzGCxUujk54TmwSFIz2dKiLEjk0uyRVi5HSmsCxAVN9LGYzetWSi9av_psMbtfpD9fH9vSHwQiLacYbgh5opKJHKsg84SYW9yNtk2iW7Ec0PoEEVh4ngTXWACxxTUBpV9VRBZNvHPDtw0D02F2CXPcI0MX5uL3kx-sMgMq90pUcz4OvYg7FlwRqp4f42MfVyshhjUY8B3FceOtszZff5P7wRJzgIl88vrdqvUEaZRB_ydCfp5QBKt6crx-JHurPkZyts-Nj",
  description:
    "ที่ CraftBikeLab เราไม่ใช่แค่เว็บไซต๋ แต่คือ 'เพื่อน' ที่ช่วยคุณเลือกของแต่ง และ 'ไกด์' ที่ร่วมแชร์ประสบการณ์ท่องเที่ยว ขอบคุณที่ให้เราเป็นส่วนหนึ่งของการเดินทางของคุณ",
};

export const fuelPrices: FuelPrice[] = [
  { label: "Gasohol 95", value: "43.25", unit: "THB/L" },
  { label: "E20", value: "38.25", unit: "THB/L" },
  { label: "Diesel", value: "44.24", unit: "THB/L" },
  { label: "E85", value: "34.99", unit: "THB/L" },
  { label: "Gasohol 91", value: "42.88", unit: "THB/L" },
];

export const featuredStories: StoryCard[] = [
  {
    eyebrow: "Featured",
    title: 'CraftBikeLab เปิดตัวแคมเปญพิเศษ "Craft Your Ride"',
    description:
      "พบกับโปรโมชันจัดเต็มสำหรับนักบิดตัวจริง รับส่วนลดสูงสุด 50% เมื่อซื้อครบชุด พร้อมบริการแนะนำการแต่งรถแบบตัวต่อตัว...",
    href: "/news",
  },
  {
    eyebrow: "Events",
    title: "รวมพลคนรักสองล้อ Midnight Meetup ครั้งที่ 3",
    description:
      "พบปะนักบิดทั่วประเทศ ณ สนามวงจรกลางคืน พร้อมกิจกรรมพิเศษ การแข่งขันสกิล และของรางวัลมากมาย...",
    href: "/news",
  },
];

export const newsExtras: NewsExtraCard[] = [
  {
    eyebrow: "Technique",
    title: "เทคนิคการทรงตัวในโค้งหักศอก",
    description: "วิธีมองไลน์, คุมคันเร่ง, และวางน้ำหนักตัวอย่างมั่นใจ",
    href: "/craft",
    icon: "engineering",
  },
  {
    eyebrow: "Industry",
    title: "มาตรฐานไอเสียใหม่ เริ่มต้นปีหน้า",
    description: "อัปเดตสิ่งที่คนแต่งรถควรรู้ก่อนเลือกท่อและจูน",
    href: "/news",
    icon: "spark",
  },
  {
    eyebrow: "Trip",
    title: 'เปิดตัวเส้นทางทริปใหม่ "แดนเหนือ"',
    description: "เส้นทางขี่ที่รวมภูเขา, โค้ง, และจุดแวะที่ใช้เวลาไม่เยอะ",
    href: "/trip",
    icon: "route",
  },
];

export const shopHighlights: ProductCard[] = [
  {
    title: "Akrapovic Titanium Pro",
    description: "Maximum power output & lightweight design.",
    price: "฿ 45,500",
    icon: "exhaust",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB1KdyXctvZ_5IMucPOOr3sQ_VW7zB9Es4eIddgiSjGAfxf5NR8rCQOVAjGu6gIWjzllVU-2kqDdInhEIrZymoI_VvDXIZVV_flp6YkLcq9z-_K3BU230EsvdP7zMeItKOBglBTFaWTDeKn84ZP1ao6RxqYr7s2QWgykmf3IDiwbXTOBkfV64Ed1bcl8zDSZptauOO4W0DOAluN8Dz2xI2-DluC0xFJZMORkVu0VN54Q-jxYVmkvP92ONiIobOF4dRFsI2SDNLu1t9v",
  },
  {
    title: "Brembo GP4-RS Kit",
    description: "Track-ready stopping power & heat control.",
    price: "฿ 32,900",
    icon: "brake",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAu8xPgXWfZBIFnPhoX7Qv7ZP_fwuvZRuKrc2Wrnf2RBzLE-qKssgorVb4uQalflVF6Mkdv8vwDT7frBju9KhveARMKnZWCKR34tnbjWqv5Wk-McGivRAq7RCmDsIgEdKJbENMY7iuAoshB4Fge_DDggdPO3fK8ovAG0vX6_1X_F5dELe7sROciJO9Ju2yKWrum6ch5Gf27cxeDvhztFV88hU7cPF_nHY1AeoMsycBIuhx-Mrxc1uSK93t_JSfvxGOa5fPiPoLBifDZ",
  },
  {
    title: "Ohlins TTX GP Rear",
    description: "Premium shock absorption for true stability.",
    price: "฿ 58,000",
    icon: "suspension",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDTIiKXrRusl934DDDAAX4XWyyhXMcKP7iz-Cwruum5vFH_9OCrUtN5rJyakhydnFdaDD-WmTC2zq4pNIsjZmylIaX71dez-cvZFU3DWsIDKmmADN-n1HOw4i-mhWm9_n6hU6ZwqSBSBw5TEycJHZGujJ5YAekx6u-on_iHtndeBRXQ5BsEvSN9FZ9eB8vf16b5B3LHSVypx7xxMWrLShDWzTVpDbYegNtbdSZTw0xBLlN9ssXTUU46YtBKV87w8krJLji-wjc9V5jv",
  },
];

export const shopMiniCards: ProductCard[] = [
  { title: "YSS Suspension", description: "฿ 8,900", price: "฿ 8,900", icon: "motorcycle" },
  { title: "Brembo Pads", description: "฿ 2,500", price: "฿ 2,500", icon: "brake" },
  { title: "Pirelli Diablo", description: "฿ 12,500", price: "฿ 12,500", icon: "tire" },
  { title: "Shoei Helmet", description: "฿ 24,900", price: "฿ 24,900", icon: "helmet" },
  { title: "Motul 300V", description: "฿ 1,200", price: "฿ 1,200", icon: "oil" },
  { title: "Dainese Gloves", description: "฿ 5,400", price: "฿ 5,400", icon: "gloves" },
];

export const routeCards: RouteCard[] = [
  {
    title: "Mae Hong Son Loop",
    region: "Northern Route",
    description: "The gold standard of Northern Thailand. 1,864 curves of pure joy.",
    icon: "route",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqvoapLHCBZz5hzHTsRUPc37bRJgf3cxZYWnP_1jDFX_FTEgEjCYMhQn6n259rv_EL0nNy_zzLCVpUEm3hRDmWfhQII8L09NCvIrj9bugQLADTriRX7yNfStnBaBo7V1btab4FENf7Pw47VjQyHM6vaDahCLDjODaGlF5PqQl0GuLqcNu5bwhcOU2tGb2MMOxI3dgWdJAd0HQTa44zS3LwQX3YhFxaktLLJ_n8gJhu1iznP5NqyEUiM2DIAqZLPddFv1jIGTix0U4i",
  },
  {
    title: "Chanthaburi Coast",
    region: "Coastal Route",
    description: "High-speed sweeping curves along the beautiful Gulf of Thailand.",
    icon: "waves",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuRVbTZgyBFAT1V5aB1z-ePrJbfuDDhgyqKnns_c1IxoyhTJ2lZMn6YQJCw64OvRwOPYKCUrClS4WGhMALaD38LmBjZMJODQA10gZmSCMTOaF0zsPDuCtmS_EPTTil2A0utajA9C64wtqRX2N5FVhwhiiuSv858BTbjQHnbF5FQFRQ8H5vjb-ZyM6HoIiV4GVFTmXsW3MQCifEiTuPJPPJ17oyvPAoe4Gb4ooPSx1XCzZAffiU0APkg5BTel94o3cAKSd8OkaAuiSc",
  },
  {
    title: "Khao Yai National",
    region: "Mountain Route",
    description: "Deep greens and technical handling through Thailand's premier park.",
    icon: "mountain",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBhEjui6Tq3IcVULyedBfulXsAGXr3wWut1jDaBKMjt19rcA1IQCVPAOxuS5r38maWq_HcIIIcvmdnVb9GnUU9vPwVgE9qhU1550tBuyJLYJ9G3ydcEx-G7UKpsefWtOjwrSgEhTxb3Siq9AtXTH5sgnR89IrFG6pfdGTZqrPIIL1eGbtOApYfr7nGr3bXtbAbiKtTCh8SmERnH1rzIE4f2I3IhUXcg2LfdKqSQ-Ni52X3_8bYLuec9A3nf0AokcjINl8o21ZbUBv-s",
  },
];

export const miniRoutes: RouteCard[] = [
  {
    title: "Phu Kradueng",
    region: "อีสาน",
    description: "Climb-focused ride with open sky and long reward.",
    icon: "terrain",
    image: "",
  },
  {
    title: "Doi Inthanon",
    region: "เหนือ",
    description: "Cool air, elevation, and steady switchbacks.",
    icon: "forest",
    image: "",
  },
  {
    title: "Samui Ring",
    region: "ใต้",
    description: "Island loop with easy pace and sea views.",
    icon: "beach",
    image: "",
  },
  {
    title: "Mekong Ride",
    region: "อีสาน",
    description: "Wide roads, river light, and long-distance rhythm.",
    icon: "water",
    image: "",
  },
  {
    title: "Kwai Bridge",
    region: "กลาง",
    description: "Historic stop with a clean day-trip loop.",
    icon: "bridge",
    image: "",
  },
  {
    title: "Phang Nga Bay",
    region: "ใต้",
    description: "Coastal air, rolling scenery, and scenic detours.",
    icon: "hiking",
    image: "",
  },
];

export const footerLinks = {
  policy: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
  social: [
    { label: "Facebook", href: "https://www.facebook.com/Gutumrodv2" },
    { label: "YouTube", href: "https://www.youtube.com/@Gutumrod" },
    { label: "Line", href: "https://lin.ee/7o9bads" },
    { label: "TikTok", href: "https://www.tiktok.com/@gutumrod" },
  ],
  contact: [
    { label: "080-074-2005", href: "tel:0800742005" },
    { label: "titazmth@gmail.com", href: "mailto:titazmth@gmail.com" },
  ],
};

export const brandStatement = {
  title: "The ride is personal. The build should be too.",
  description:
    "We keep the homepage focused on the essentials: what to buy, what to read, and where to ride next.",
};
