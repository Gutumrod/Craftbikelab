// ข้อมูลรุ่นรถมอเตอร์ไซค์ยอดนิยมในไทย
export const motorcycleModels = [
  { id: "honda-wave125", name: "Honda Wave 125i", brand: "Honda", type: "underbone" },
  { id: "honda-click160", name: "Honda Click 160", brand: "Honda", type: "scooter" },
  { id: "honda-pcx160", name: "Honda PCX 160", brand: "Honda", type: "scooter" },
  { id: "honda-cbr150r", name: "Honda CBR150R", brand: "Honda", type: "sport" },
  { id: "honda-cb150r", name: "Honda CB150R", brand: "Honda", type: "naked" },
  { id: "honda-rebel500", name: "Honda Rebel 500", brand: "Honda", type: "cruiser" },
  { id: "yamaha-mt15", name: "Yamaha MT-15", brand: "Yamaha", type: "naked" },
  { id: "yamaha-r15", name: "Yamaha YZF-R15", brand: "Yamaha", type: "sport" },
  { id: "yamaha-nmax", name: "Yamaha NMAX", brand: "Yamaha", type: "scooter" },
  { id: "yamaha-aerox", name: "Yamaha Aerox", brand: "Yamaha", type: "scooter" },
  { id: "yamaha-xmax", name: "Yamaha XMAX", brand: "Yamaha", type: "scooter" },
  { id: "kawasaki-ninja400", name: "Kawasaki Ninja 400", brand: "Kawasaki", type: "sport" },
  { id: "kawasaki-z400", name: "Kawasaki Z400", brand: "Kawasaki", type: "naked" },
  { id: "kawasaki-ninja250", name: "Kawasaki Ninja 250", brand: "Kawasaki", type: "sport" },
  { id: "gpx-demon", name: "GPX Demon 150GR", brand: "GPX", type: "sport" },
  { id: "gpx-gentleman", name: "GPX Gentleman Racer", brand: "GPX", type: "cafe-racer" },
];

// หมวดหมู่ของแต่ง
export const partCategories = [
  { id: "exhaust", name: "ท่อไอเสีย", icon: "🔧", budgetRatio: 0.25 },
  { id: "suspension", name: "ช่วงล่าง/โช้ค", icon: "⚙️", budgetRatio: 0.20 },
  { id: "brake", name: "ระบบเบรก", icon: "🛑", budgetRatio: 0.15 },
  { id: "body", name: "ชุดแต่ง/แฟริ่ง", icon: "🏍️", budgetRatio: 0.15 },
  { id: "lighting", name: "ไฟ/LED", icon: "💡", budgetRatio: 0.10 },
  { id: "accessories", name: "อุปกรณ์เสริม", icon: "🎯", budgetRatio: 0.15 },
];

// ข้อมูลของแต่งจำลอง
export interface Part {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compatibleModels: string[];
  image: string;
  description: string;
  rating: number;
}

export const partsDatabase: Part[] = [
  // ท่อไอเสีย
  { id: "ex-001", name: "ท่อ Akrapovic Slip-On", brand: "Akrapovic", category: "exhaust", price: 25000, compatibleModels: ["honda-cbr150r", "honda-cb150r", "yamaha-r15", "yamaha-mt15"], image: "/parts/exhaust-1.jpg", description: "ท่อไอเสียแบรนด์ชั้นนำ เสียงทุ้ม แรงเพิ่ม", rating: 4.9 },
  { id: "ex-002", name: "ท่อ Yoshimura R-77", brand: "Yoshimura", category: "exhaust", price: 18000, compatibleModels: ["honda-cbr150r", "kawasaki-ninja250", "kawasaki-ninja400"], image: "/parts/exhaust-2.jpg", description: "ท่อแข่งระดับ MotoGP เสียงดังฟังชัด", rating: 4.8 },
  { id: "ex-003", name: "ท่อ R9 Valencia", brand: "R9", category: "exhaust", price: 8500, compatibleModels: ["honda-wave125", "yamaha-aerox", "honda-click160"], image: "/parts/exhaust-3.jpg", description: "ท่อราคาประหยัด คุณภาพคุ้มค่า", rating: 4.5 },
  { id: "ex-004", name: "ท่อ Arrow Pro-Race", brand: "Arrow", category: "exhaust", price: 15000, compatibleModels: ["yamaha-mt15", "yamaha-r15", "honda-cb150r"], image: "/parts/exhaust-4.jpg", description: "ท่อแข่งอิตาลี น้ำหนักเบา", rating: 4.7 },
  { id: "ex-005", name: "ท่อ SC-Project GP70-R", brand: "SC-Project", category: "exhaust", price: 32000, compatibleModels: ["kawasaki-ninja400", "kawasaki-z400", "honda-rebel500"], image: "/parts/exhaust-5.jpg", description: "ท่อ Full System ระดับโปร", rating: 4.9 },
  { id: "ex-006", name: "ท่อ Redmoto GP Full", brand: "Redmoto", category: "exhaust", price: 5500, compatibleModels: ["honda-wave125", "honda-click160", "yamaha-nmax"], image: "/parts/exhaust-6.jpg", description: "ท่อราคาเบาๆ สำหรับผู้เริ่มต้น", rating: 4.2 },

  // ช่วงล่าง/โช้ค
  { id: "sus-001", name: "โช้คหลัง YSS G-Sport", brand: "YSS", category: "suspension", price: 12000, compatibleModels: ["honda-click160", "yamaha-aerox", "yamaha-nmax"], image: "/parts/shock-1.jpg", description: "โช้คคู่แก๊ส ปรับได้ 3 ระดับ", rating: 4.7 },
  { id: "sus-002", name: "โช้คหน้า Öhlins NIX30", brand: "Öhlins", category: "suspension", price: 45000, compatibleModels: ["honda-cbr150r", "yamaha-r15", "kawasaki-ninja400"], image: "/parts/shock-2.jpg", description: "โช้คหน้าระดับ World Superbike", rating: 5.0 },
  { id: "sus-003", name: "โช้คหลัง Gazi ECO Line", brand: "Gazi", category: "suspension", price: 6500, compatibleModels: ["honda-wave125", "yamaha-aerox", "honda-click160"], image: "/parts/shock-3.jpg", description: "โช้คราคาประหยัด คุณภาพดี", rating: 4.4 },
  { id: "sus-004", name: "โช้คหลัง K-Tech Razor", brand: "K-Tech", category: "suspension", price: 28000, compatibleModels: ["kawasaki-ninja400", "yamaha-mt15", "honda-cb150r"], image: "/parts/shock-4.jpg", description: "โช้คแข่งจากอังกฤษ ปรับได้ทุกอย่าง", rating: 4.8 },
  { id: "sus-005", name: "โช้คหลัง Racing Boy", brand: "Racing Boy", category: "suspension", price: 3500, compatibleModels: ["honda-wave125", "honda-click160", "yamaha-nmax"], image: "/parts/shock-5.jpg", description: "โช้คเริ่มต้น ใช้งานทั่วไป", rating: 4.1 },

  // ระบบเบรก
  { id: "brk-001", name: "ดิสก์เบรก Brembo 320mm", brand: "Brembo", category: "brake", price: 18000, compatibleModels: ["kawasaki-ninja400", "yamaha-r15", "honda-cbr150r"], image: "/parts/brake-1.jpg", description: "จานเบรกหน้าระบายความร้อนได้ดี", rating: 4.9 },
  { id: "brk-002", name: "ผ้าเบรก Ferodo Racing", brand: "Ferodo", category: "brake", price: 3500, compatibleModels: ["honda-cbr150r", "yamaha-mt15", "kawasaki-ninja250"], image: "/parts/brake-2.jpg", description: "ผ้าเบรกแข่ง กัดดีเยี่ยม", rating: 4.7 },
  { id: "brk-003", name: "ปั๊มเบรก Nissin Radial", brand: "Nissin", category: "brake", price: 8500, compatibleModels: ["yamaha-r15", "honda-cb150r", "kawasaki-z400"], image: "/parts/brake-3.jpg", description: "ปั๊มเบรกแบบ Radial ตอบสนองไว", rating: 4.6 },
  { id: "brk-004", name: "สาย Brake Goodridge", brand: "Goodridge", category: "brake", price: 2500, compatibleModels: ["honda-wave125", "yamaha-aerox", "honda-click160", "yamaha-nmax"], image: "/parts/brake-4.jpg", description: "สายเบรกถัก Steel เบรกหนึบ", rating: 4.5 },
  { id: "brk-005", name: "ชุดเบรก Racing Boy", brand: "Racing Boy", category: "brake", price: 4500, compatibleModels: ["honda-wave125", "honda-click160", "yamaha-aerox"], image: "/parts/brake-5.jpg", description: "ชุดเบรกครบเซ็ต ราคาคุ้ม", rating: 4.3 },

  // ชุดแต่ง/แฟริ่ง
  { id: "bdy-001", name: "ชุดแฟริ่ง Carbon", brand: "Ilmberger", category: "body", price: 35000, compatibleModels: ["honda-cbr150r", "yamaha-r15", "kawasaki-ninja400"], image: "/parts/body-1.jpg", description: "แฟริ่งคาร์บอนแท้ น้ำหนักเบา", rating: 4.8 },
  { id: "bdy-002", name: "หน้ากาก MHR", brand: "MHR", category: "body", price: 4500, compatibleModels: ["honda-click160", "yamaha-aerox", "yamaha-nmax"], image: "/parts/body-2.jpg", description: "หน้ากากสปอร์ต ดุดัน", rating: 4.4 },
  { id: "bdy-003", name: "บังโคลน Carbon", brand: "Carbon Tech", category: "body", price: 8000, compatibleModels: ["yamaha-mt15", "honda-cb150r", "kawasaki-z400"], image: "/parts/body-3.jpg", description: "บังโคลนคาร์บอนสั้น ดูแข็งแกร่ง", rating: 4.6 },
  { id: "bdy-004", name: "ชุดสี Racing Custom", brand: "Custom Shop", category: "body", price: 15000, compatibleModels: ["honda-cbr150r", "yamaha-r15", "gpx-demon"], image: "/parts/body-4.jpg", description: "ชุดสีลายแข่ง พ่นมือ", rating: 4.7 },
  { id: "bdy-005", name: "สติกเกอร์ลายแต่ง", brand: "Decal Pro", category: "body", price: 2500, compatibleModels: ["honda-wave125", "honda-click160", "yamaha-aerox", "yamaha-nmax"], image: "/parts/body-5.jpg", description: "สติกเกอร์กันน้ำ ทนแดด", rating: 4.2 },

  // ไฟ/LED
  { id: "lit-001", name: "ไฟหน้า LED Projector", brand: "Biled", category: "lighting", price: 6500, compatibleModels: ["honda-wave125", "honda-click160", "yamaha-aerox"], image: "/parts/light-1.jpg", description: "ไฟหน้าแบบ Projector สว่างกว่าเดิม 3 เท่า", rating: 4.6 },
  { id: "lit-002", name: "ไฟท้าย Sequential", brand: "JPA", category: "lighting", price: 3500, compatibleModels: ["honda-cbr150r", "yamaha-r15", "yamaha-mt15"], image: "/parts/light-2.jpg", description: "ไฟท้ายวิ่ง สไตล์ซุปเปอร์คาร์", rating: 4.5 },
  { id: "lit-003", name: "ไฟเลี้ยว LED", brand: "Rizoma", category: "lighting", price: 4500, compatibleModels: ["kawasaki-ninja400", "honda-cb150r", "yamaha-mt15"], image: "/parts/light-3.jpg", description: "ไฟเลี้ยวมินิมอล สไตล์ยุโรป", rating: 4.7 },
  { id: "lit-004", name: "ไฟ Underglow RGB", brand: "LED Custom", category: "lighting", price: 2500, compatibleModels: ["honda-click160", "yamaha-aerox", "yamaha-nmax"], image: "/parts/light-4.jpg", description: "ไฟใต้ท้อง เปลี่ยนสีได้ ควบคุมผ่านแอป", rating: 4.3 },
  { id: "lit-005", name: "ชุด LED Bar DRL", brand: "Osram", category: "lighting", price: 5500, compatibleModels: ["honda-cbr150r", "kawasaki-ninja250", "gpx-demon"], image: "/parts/light-5.jpg", description: "ไฟเดย์ไลท์ LED แบรนด์ดัง", rating: 4.8 },

  // อุปกรณ์เสริม
  { id: "acc-001", name: "กันล้ม Evotech", brand: "Evotech", category: "accessories", price: 5500, compatibleModels: ["honda-cbr150r", "yamaha-r15", "kawasaki-ninja400"], image: "/parts/acc-1.jpg", description: "กันล้มน้ำหนักเบา ป้องกันรถได้ดี", rating: 4.8 },
  { id: "acc-002", name: "แฮนด์จับ CNC", brand: "Rizoma", category: "accessories", price: 8500, compatibleModels: ["yamaha-mt15", "honda-cb150r", "kawasaki-z400"], image: "/parts/acc-2.jpg", description: "แฮนด์อลูมิเนียม CNC สวยงาม", rating: 4.7 },
  { id: "acc-003", name: "พักเท้าหลัง Bikers", brand: "Bikers", category: "accessories", price: 3500, compatibleModels: ["honda-click160", "yamaha-aerox", "yamaha-nmax"], image: "/parts/acc-3.jpg", description: "พักเท้าหลังพับได้ หลากสี", rating: 4.4 },
  { id: "acc-004", name: "กระจกมองข้าง Carbon", brand: "MotoGP", category: "accessories", price: 2500, compatibleModels: ["honda-cbr150r", "yamaha-r15", "gpx-demon"], image: "/parts/acc-4.jpg", description: "กระจกคาร์บอน แอโร่ไดนามิค", rating: 4.5 },
  { id: "acc-005", name: "ที่พักมือ Quick Shifter", brand: "HealTech", category: "accessories", price: 12000, compatibleModels: ["kawasaki-ninja400", "yamaha-r15", "honda-cbr150r"], image: "/parts/acc-5.jpg", description: "ระบบเปลี่ยนเกียร์แบบแข่ง ไม่ต้องบีบครัตช์", rating: 4.9 },
  { id: "acc-006", name: "กันดีด", brand: "Ermax", category: "accessories", price: 1500, compatibleModels: ["honda-wave125", "honda-click160", "yamaha-nmax"], image: "/parts/acc-6.jpg", description: "กันดีดน้ำ/โคลน ปกป้องรถ", rating: 4.2 },
];

// ฟังก์ชันคำนวณของแต่งตามงบประมาณ
export function calculatePartsRecommendation(budget: number, modelId: string): { category: string; categoryName: string; allocatedBudget: number; recommendedPart: Part | null }[] {
  // กรองของแต่งที่ใช้ได้กับรุ่นรถ
  const compatibleParts = partsDatabase.filter(part => 
    part.compatibleModels.includes(modelId)
  );

  // คำนวณงบประมาณสำหรับแต่ละหมวด
  const recommendations = partCategories.map(category => {
    const allocatedBudget = Math.floor(budget * category.budgetRatio);
    
    // หาของแต่งในหมวดนี้ที่เหมาะสมกับงบ
    const categoryParts = compatibleParts
      .filter(part => part.category === category.id && part.price <= allocatedBudget)
      .sort((a, b) => b.price - a.price); // เรียงจากแพงไปถูก เพื่อให้ได้ของที่คุ้มค่าที่สุด

    return {
      category: category.id,
      categoryName: category.name,
      allocatedBudget,
      recommendedPart: categoryParts[0] || null, // เลือกของที่แพงที่สุดในงบ
    };
  });

  return recommendations;
}