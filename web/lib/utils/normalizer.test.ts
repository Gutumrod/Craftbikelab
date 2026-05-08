/**
 * Test Cases สำหรับ Normalizer
 * ทดสอบ 50 รุ่นรถ + คำพิมพ์ผิด + คำเรียกแบบคนไทย
 */

import { normalizeModelName, isKnownModel, getDisplayName } from './normalizer';

interface TestCase {
  query: string;
  expected: string;
  displayName: string;
}

export const TEST_CASES: TestCase[] = [
  // ========== YAMAHA NMAX ==========
  { query: 'nmax', expected: 'nmax155', displayName: 'Yamaha NMAX 155' },
  { query: 'nmax155', expected: 'nmax155', displayName: 'Yamaha NMAX 155' },
  { query: 'nแม็ก', expected: 'nmax155', displayName: 'Yamaha NMAX 155' },
  { query: 'nmax ตัวใหม่', expected: 'nmax155', displayName: 'Yamaha NMAX 155' },
  
  // ========== HONDA PCX ==========
  { query: 'pcx', expected: 'pcx160', displayName: 'Honda PCX 160' },
  { query: 'pcx160', expected: 'pcx160', displayName: 'Honda PCX 160' },
  { query: 'pcx ตัวเก่า', expected: 'pcx150', displayName: 'Honda PCX 150' },
  { query: 'pcx 150', expected: 'pcx150', displayName: 'Honda PCX 150' },
  { query: 'pcxตัวใหม่', expected: 'pcx160', displayName: 'Honda PCX 160' },
  
  // ========== HONDA FORZA ==========
  { query: 'ฟอซ่า', expected: 'forza350', displayName: 'Honda Forza 350' },
  { query: 'forza', expected: 'forza350', displayName: 'Honda Forza 350' },
  { query: 'forza350', expected: 'forza350', displayName: 'Honda Forza 350' },
  { query: 'forza ตัวใหม่', expected: 'forza350', displayName: 'Honda Forza 350' },
  { query: 'forza300', expected: 'forza300', displayName: 'Honda Forza 300' },
  
  // ========== HONDA ADV ==========
  { query: 'adv350', expected: 'adv350', displayName: 'Honda ADV 350' },
  { query: 'adv 350', expected: 'adv350', displayName: 'Honda ADV 350' },
  { query: 'adv ตัวใหม่', expected: 'adv350', displayName: 'Honda ADV 350' },
  { query: 'adv160', expected: 'adv160', displayName: 'Honda ADV 160' },
  { query: 'adv 160', expected: 'adv160', displayName: 'Honda ADV 160' },
  { query: 'adv ตัวเล็ก', expected: 'adv160', displayName: 'Honda ADV 160' },
  
  // ========== YAMAHA AEROX ==========
  { query: 'aerox', expected: 'aerox155', displayName: 'Yamaha Aerox 155' },
  { query: 'aerox155', expected: 'aerox155', displayName: 'Yamaha Aerox 155' },
  { query: 'แอร็อก', expected: 'aerox155', displayName: 'Yamaha Aerox 155' },
  
  // ========== YAMAHA XSR ==========
  { query: 'xsr155', expected: 'xsr155', displayName: 'Yamaha XSR155' },
  { query: 'xsr 155', expected: 'xsr155', displayName: 'Yamaha XSR155' },
  { query: 'xsr', expected: 'xsr155', displayName: 'Yamaha XSR155' },
  
  // ========== YAMAHA MT ==========
  { query: 'mt15', expected: 'mt15', displayName: 'Yamaha MT-15' },
  { query: 'mt 15', expected: 'mt15', displayName: 'Yamaha MT-15' },
  { query: 'mt-15', expected: 'mt15', displayName: 'Yamaha MT-15' },
  { query: 'mt03', expected: 'mt03', displayName: 'Yamaha MT-03' },
  { query: 'mt 03', expected: 'mt03', displayName: 'Yamaha MT-03' },
  
  // ========== YAMAHA R SERIES ==========
  { query: 'r15', expected: 'r15', displayName: 'Yamaha R15' },
  { query: 'r15m', expected: 'r15m', displayName: 'Yamaha R15M' },
  { query: 'r3', expected: 'r3', displayName: 'Yamaha R3' },
  
  // ========== KAWASAKI NINJA ==========
  { query: 'ninja400', expected: 'ninja400', displayName: 'Kawasaki Ninja 400' },
  { query: 'ninja 400', expected: 'ninja400', displayName: 'Kawasaki Ninja 400' },
  { query: 'นินจา400', expected: 'ninja400', displayName: 'Kawasaki Ninja 400' },
  
  // ========== KAWASAKI Z ==========
  { query: 'z400', expected: 'z400', displayName: 'Kawasaki Z400' },
  { query: 'z 400', expected: 'z400', displayName: 'Kawasaki Z400' },
  { query: 'z900', expected: 'z900', displayName: 'Kawasaki Z900' },
  { query: 'z 900', expected: 'z900', displayName: 'Kawasaki Z900' },
  
  // ========== HONDA CB ==========
  { query: 'cb650r', expected: 'cb650r', displayName: 'Honda CB650R' },
  { query: 'cb 650 r', expected: 'cb650r', displayName: 'Honda CB650R' },
  
  // ========== HONDA CBR ==========
  { query: 'cbr650r', expected: 'cbr650r', displayName: 'Honda CBR650R' },
  { query: 'cbr 650', expected: 'cbr650r', displayName: 'Honda CBR650R' },
  
  // ========== HONDA REBEL ==========
  { query: 'rebel300', expected: 'rebel300', displayName: 'Honda Rebel 300' },
  { query: 'rebel 300', expected: 'rebel300', displayName: 'Honda Rebel 300' },
  
  // ========== ROYAL ENFIELD ==========
  { query: 'meteor350', expected: 'meteor350', displayName: 'Royal Enfield Meteor 350' },
  { query: 'meteor 350', expected: 'meteor350', displayName: 'Royal Enfield Meteor 350' },
  { query: 'continental gt', expected: 'continentalgt650', displayName: 'Royal Enfield Continental GT 650' },
];

/**
 * ฟังก์ชันทดสอบ Normalizer
 */
export function runTests(): void {
  console.log('🧪 กำลังทดสอบ Normalizer...\n');
  
  let passed = 0;
  let failed = 0;
  const failures: Array<{ query: string; expected: string; actual: string }> = [];
  
  TEST_CASES.forEach((testCase, index) => {
    const result = normalizeModelName(testCase.query);
    const isKnown = isKnownModel(testCase.query);
    const display = getDisplayName(result);
    
    if (result === testCase.expected) {
      passed++;
      console.log(`✅ Test ${index + 1}: "${testCase.query}" → "${result}" (${display})`);
    } else {
      failed++;
      failures.push({
        query: testCase.query,
        expected: testCase.expected,
        actual: result
      });
      console.log(`❌ Test ${index + 1}: "${testCase.query}"`);
      console.log(`   Expected: "${testCase.expected}"`);
      console.log(`   Got: "${result}"`);
    }
    
    if (!isKnown) {
      console.warn(`⚠️  Warning: "${testCase.query}" is normalized to "${result}" but not in knownModels list`);
    }
  });
  
  console.log(`\n📊 สรุปผลการทดสอบ:`);
  console.log(`✅ ผ่าน: ${passed}/${TEST_CASES.length}`);
  console.log(`❌ ไม่ผ่าน: ${failed}/${TEST_CASES.length}`);
  console.log(`📈 อัตราความสำเร็จ: ${((passed / TEST_CASES.length) * 100).toFixed(2)}%`);
  
  if (failures.length > 0) {
    console.log(`\n❌ รายการที่ไม่ผ่าน:`);
    failures.forEach(f => {
      console.log(`   "${f.query}": คาดหวัง "${f.expected}" แต่ได้ "${f.actual}"`);
    });
  }
}

// Auto-run tests if executed directly
if (require.main === module) {
  runTests();
}
