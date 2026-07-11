/**
 * Normalizer Utility
 * แปลงชื่อรุ่นรถให้เป็น normalized format
 */

// ทำความสะอาด input ก่อน match alias
function cleanInput(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[-_]/g, '')
    .replace(/[^฀-๿a-z0-9\s]/g, '');
}

// Cache aliases จาก Supabase (โหลดครั้งเดียวต่อ process)
let aliasCache: Record<string, string> | null = null;

export async function loadAliasesFromDB(): Promise<Record<string, string>> {
  if (aliasCache) return aliasCache;

  try {
    const { getSupabaseClient } = await import('../supabase');
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.warn('[Normalizer] ไม่พบ Supabase env ใช้ fallback แทน');
      return HARDCODED_ALIASES;
    }

    const { data, error } = await supabase
      .from('model_aliases')
      .select('alias, model_slug');

    if (error || !data || data.length === 0) {
      console.warn('[Normalizer] ดึง aliases จาก DB ไม่ได้ ใช้ fallback แทน');
      return HARDCODED_ALIASES;
    }

    aliasCache = {};
    for (const row of data) {
      aliasCache[row.alias] = row.model_slug;
    }
    return aliasCache;
  } catch {
    console.warn('[Normalizer] เชื่อมต่อ DB ไม่ได้ ใช้ fallback แทน');
    return HARDCODED_ALIASES;
  }
}

// Async version — ดึงจาก Supabase, fallback เป็น hardcoded
export async function normalizeModelNameWithDB(input: string): Promise<string> {
  const cleaned = cleanInput(input);
  const aliases = await loadAliasesFromDB();

  for (const [alias, slug] of Object.entries(aliases)) {
    if (cleaned.includes(alias)) return slug;
  }

  return cleaned.replace(/\s+/g, '');
}

// Sync version — ใช้ hardcoded เท่านั้น (backward compat)
export const normalizeModelName = (input: string): string => {
  const normalized = cleanInput(input);

  for (const [alias, standard] of Object.entries(HARDCODED_ALIASES)) {
    if (normalized.includes(alias)) return standard;
  }

  return normalized.replace(/\s+/g, '');
};

// Hardcoded aliases — fallback + sync version
const HARDCODED_ALIASES: Record<string, string> = {
  // ========== HONDA ==========
  'พีซีเอ็กซ์': 'pcx160',
  'pcx': 'pcx160',
  'pcx 150': 'pcx150',
  'pcx150': 'pcx150',
  'pcx 160': 'pcx160',
  'pcx160': 'pcx160',
  'pcx ตัวเก่า': 'pcx150',
  'pcx ตัวใหม่': 'pcx160',
  'pcxตัวเก่า': 'pcx150',
  'pcxตัวใหม่': 'pcx160',
  'ฟอร์ซ่า': 'forza350',
  'ฟอซ่า': 'forza350',
  'forza': 'forza350',
  'forza 300': 'forza300',
  'forza300': 'forza300',
  'forza 350': 'forza350',
  'forza350': 'forza350',
  'forza ตัวใหม่': 'forza350',
  'forzaตัวใหม่': 'forza350',
  'แอดวี': 'adv350',
  'เอดีวี': 'adv350',
  'adv': 'adv350',
  'adv 150': 'adv150',
  'adv150': 'adv150',
  'adv 160': 'adv160',
  'adv160': 'adv160',
  'adv 350': 'adv350',
  'adv350': 'adv350',
  'adv ตัวใหม่': 'adv350',
  'adv ตัวเล็ก': 'adv160',
  'advตัวเล็ก': 'adv160',
  'คลิก': 'click150',
  'click': 'click150',
  'click 125': 'click125',
  'click125': 'click125',
  'click 150': 'click150',
  'click150': 'click150',
  'click 160': 'click160',
  'click160': 'click160',
  'เวฟ': 'wave110',
  'wave': 'wave110',
  'wave 110': 'wave110',
  'wave110': 'wave110',
  'wave 125': 'wave125',
  'wave125': 'wave125',
  'ซีบี': 'cb650r',
  'cb': 'cb650r',
  'cb 150': 'cb150',
  'cb150': 'cb150',
  'cb 650': 'cb650r',
  'cb650': 'cb650r',
  'cb 650 r': 'cb650r',
  'cb650r': 'cb650r',
  'ซีบีอาร์': 'cbr150',
  'cbr': 'cbr150',
  'cbr 150': 'cbr150',
  'cbr150': 'cbr150',
  'cbr 650': 'cbr650r',
  'cbr650': 'cbr650r',
  'cbr 650 r': 'cbr650r',
  'cbr650r': 'cbr650r',
  'rebel': 'rebel300',
  'rebel 300': 'rebel300',
  'rebel300': 'rebel300',
  'rebel 500': 'rebel500',
  'rebel500': 'rebel500',
  'เอ็มเอสเอ็กซ์': 'msx125',
  'msx': 'msx125',
  'msx 125': 'msx125',
  'msx125': 'msx125',
  'กรม': 'grom125',
  'grom': 'grom125',
  'grom 125': 'grom125',
  'grom125': 'grom125',

  // ========== YAMAHA ==========
  'เอ็นแม็ก': 'nmax155',
  'เอ็นแม็กซ์': 'nmax155',
  'นแม็ก': 'nmax155',
  'nmax': 'nmax155',
  'nmax 155': 'nmax155',
  'nmax155': 'nmax155',
  'nmax ตัวใหม่': 'nmax155',
  'nmaxตัวใหม่': 'nmax155',
  'แอร์โรคส': 'aerox155',
  'แอร็อก': 'aerox155',
  'เอร็อก': 'aerox155',
  'aerox': 'aerox155',
  'aerox 155': 'aerox155',
  'aerox155': 'aerox155',
  'xsr': 'xsr155',
  'xsr 155': 'xsr155',
  'xsr155': 'xsr155',
  'เอ็มที': 'mt15',
  'mt': 'mt15',
  'mt 15': 'mt15',
  'mt15': 'mt15',
  'mt 03': 'mt03',
  'mt03': 'mt03',
  'mt 07': 'mt07',
  'mt07': 'mt07',
  'mt 09': 'mt09',
  'mt09': 'mt09',
  'mt 10': 'mt10',
  'mt10': 'mt10',
  'อาร์ 15': 'r15',
  'ยามาฮ่า อาร์ 15': 'r15',
  'r': 'r15',
  'r 15': 'r15',
  'r15': 'r15',
  'r 15 m': 'r15m',
  'r15m': 'r15m',
  'r 3': 'r3',
  'r3': 'r3',
  'r 6': 'r6',
  'r6': 'r6',
  'เอ็กซ์แม็กซ์': 'xmax300',
  'x max': 'xmax300',
  'xmax': 'xmax300',
  'xmax 300': 'xmax300',
  'xmax300': 'xmax300',
  'ฟีโน่': 'fino125',
  'fino': 'fino125',
  'fino 125': 'fino125',
  'fino125': 'fino125',
  'มีโอ': 'mio125',
  'mio': 'mio125',
  'mio 125': 'mio125',
  'mio125': 'mio125',

  // ========== KAWASAKI ==========
  'นินจา': 'ninja250',
  'ninja': 'ninja250',
  'ninja 250': 'ninja250',
  'ninja250': 'ninja250',
  'ninja 400': 'ninja400',
  'ninja400': 'ninja400',
  'นินจา 400': 'ninja400',
  'นินจา400': 'ninja400',
  'ninja 650': 'ninja650',
  'ninja650': 'ninja650',
  'ninja 1000': 'ninja1000',
  'ninja1000': 'ninja1000',
  'ซี': 'z250',
  'z': 'z250',
  'z 250': 'z250',
  'z250': 'z250',
  'z 400': 'z400',
  'z400': 'z400',
  'z 650': 'z650',
  'z650': 'z650',
  'z 900': 'z900',
  'z900': 'z900',
  'z 1000': 'z1000',
  'z1000': 'z1000',
  'เวอร์ซิส': 'versys650',
  'versys': 'versys650',
  'versys 650': 'versys650',
  'versys650': 'versys650',
  'versys 1000': 'versys1000',
  'versys1000': 'versys1000',
  'เคแอลเอ็ก': 'klx150',
  'klx': 'klx150',
  'klx 150': 'klx150',
  'klx150': 'klx150',

  // ========== ROYAL ENFIELD ==========
  'meteor': 'meteor350',
  'meteor 350': 'meteor350',
  'meteor350': 'meteor350',
  'continental': 'continentalgt650',
  'continental gt': 'continentalgt650',
  'continentalgt': 'continentalgt650',
  'continental gt 650': 'continentalgt650',
  'classic': 'classic350',
  'classic 350': 'classic350',
  'classic350': 'classic350',

  // ========== DUCATI ==========
  'มอนสเตอร์': 'monster821',
  'monster': 'monster821',
  'monster 821': 'monster821',
  'monster821': 'monster821',
  'monster 1200': 'monster1200',
  'monster1200': 'monster1200',
  'พานิกาเล่': 'panigalev4',
  'panigale': 'panigalev4',
  'panigale v2': 'panigalev2',
  'panigalev2': 'panigalev2',
  'panigale v4': 'panigalev4',
  'panigalev4': 'panigalev4',
  'สแกรมเบลอร์': 'scrambler',
  'scrambler': 'scrambler',

  // ========== BMW ==========
  'จีเอส': 'r1250gs',
  'gs': 'r1250gs',
  'r 1250 gs': 'r1250gs',
  'r1250gs': 'r1250gs',
  'r 1200 gs': 'r1200gs',
  'r1200gs': 'r1200gs',
  'เอส 1000': 's1000rr',
  's 1000': 's1000rr',
  's1000': 's1000rr',
  's 1000 rr': 's1000rr',
  's1000rr': 's1000rr',
  'อาร์ไนน์ที': 'rninet',
  'r nine t': 'rninet',
  'rninet': 'rninet',

  // ========== SUZUKI ==========
  'จิ๊กเซอร์': 'gixxer150',
  'gixxer': 'gixxer150',
  'gixxer 150': 'gixxer150',
  'gixxer150': 'gixxer150',
  'gixxer sf': 'gixxersf',
  'gixxersf': 'gixxersf',
  'gsxr': 'gsxr150',
  'gsx r': 'gsxr150',
  'gsxr 150': 'gsxr150',
  'gsxr150': 'gsxr150',
  'hayabusa': 'hayabusa',
  'ฮายาบูซ่า': 'hayabusa',

  // ========== GPX ==========
  'โดรน': 'drone150',
  'drone': 'drone150',
  'drone 150': 'drone150',
  'drone150': 'drone150',
};

/**
 * ตรวจสอบว่า query นี้เป็นรุ่นรถที่รู้จักหรือไม่
 */
export const isKnownModel = (query: string): boolean => {
  const normalized = normalizeModelName(query);
  const knownModels = [
    'cbr150', 'cbr650r', 'cb150', 'cb650r', 'msx125', 'grom125',
    'wave110', 'wave125', 'click125', 'click150', 'click160',
    'pcx150', 'pcx160', 'forza300', 'forza350',
    'adv150', 'adv160', 'adv350', 'rebel300', 'rebel500',
    'mt15', 'mt03', 'mt07', 'mt09', 'mt10',
    'r15', 'r15m', 'r3', 'r6',
    'xmax300', 'aerox155', 'nmax155', 'xsr155',
    'fino125', 'mio125',
    'ninja250', 'ninja400', 'ninja650', 'ninja1000',
    'z250', 'z400', 'z650', 'z900', 'z1000',
    'versys650', 'versys1000', 'klx150',
    'meteor350', 'continentalgt650', 'classic350',
    'monster821', 'monster1200', 'panigalev2', 'panigalev4', 'scrambler',
    'r1250gs', 'r1200gs', 's1000rr', 'rninet',
    'gixxer150', 'gixxersf', 'gsxr150', 'hayabusa',
    'drone150',
  ];
  return knownModels.includes(normalized);
};

/**
 * แปลง normalized name กลับเป็นชื่อเต็มที่แสดงผล
 */
export const getDisplayName = (normalizedName: string): string => {
  const displayNames: Record<string, string> = {
    'pcx150': 'Honda PCX 150', 'pcx160': 'Honda PCX 160',
    'forza300': 'Honda Forza 300', 'forza350': 'Honda Forza 350',
    'adv150': 'Honda ADV 150', 'adv160': 'Honda ADV 160', 'adv350': 'Honda ADV 350',
    'click125': 'Honda Click 125', 'click150': 'Honda Click 150', 'click160': 'Honda Click 160',
    'wave110': 'Honda Wave 110', 'wave125': 'Honda Wave 125',
    'cbr150': 'Honda CBR150R', 'cbr650r': 'Honda CBR650R',
    'cb150': 'Honda CB150R', 'cb650r': 'Honda CB650R',
    'rebel300': 'Honda Rebel 300', 'rebel500': 'Honda Rebel 500',
    'msx125': 'Honda MSX 125', 'grom125': 'Honda Grom 125',
    'nmax155': 'Yamaha NMAX 155', 'aerox155': 'Yamaha Aerox 155',
    'xsr155': 'Yamaha XSR155',
    'mt15': 'Yamaha MT-15', 'mt03': 'Yamaha MT-03', 'mt07': 'Yamaha MT-07',
    'mt09': 'Yamaha MT-09', 'mt10': 'Yamaha MT-10',
    'r15': 'Yamaha R15', 'r15m': 'Yamaha R15M', 'r3': 'Yamaha R3', 'r6': 'Yamaha R6',
    'xmax300': 'Yamaha XMAX 300', 'fino125': 'Yamaha Fino 125', 'mio125': 'Yamaha Mio 125',
    'ninja250': 'Kawasaki Ninja 250', 'ninja400': 'Kawasaki Ninja 400',
    'ninja650': 'Kawasaki Ninja 650', 'ninja1000': 'Kawasaki Ninja 1000',
    'z250': 'Kawasaki Z250', 'z400': 'Kawasaki Z400', 'z650': 'Kawasaki Z650',
    'z900': 'Kawasaki Z900', 'z1000': 'Kawasaki Z1000',
    'versys650': 'Kawasaki Versys 650', 'versys1000': 'Kawasaki Versys 1000',
    'klx150': 'Kawasaki KLX 150',
    'meteor350': 'Royal Enfield Meteor 350',
    'continentalgt650': 'Royal Enfield Continental GT 650',
    'classic350': 'Royal Enfield Classic 350',
    'monster821': 'Ducati Monster 821', 'monster1200': 'Ducati Monster 1200',
    'panigalev2': 'Ducati Panigale V2', 'panigalev4': 'Ducati Panigale V4',
    'scrambler': 'Ducati Scrambler',
    'r1250gs': 'BMW R 1250 GS', 'r1200gs': 'BMW R 1200 GS',
    's1000rr': 'BMW S 1000 RR', 'rninet': 'BMW R nineT',
    'gixxer150': 'Suzuki Gixxer 150', 'gixxersf': 'Suzuki Gixxer SF',
    'gsxr150': 'Suzuki GSX-R150', 'hayabusa': 'Suzuki Hayabusa',
    'drone150': 'GPX Drone 150',
  };

  return displayNames[normalizedName] || normalizedName.toUpperCase();
};
