# CraftBikeLab Project

โปรเจกต์หลักของ CraftBikeLab ที่รวมทั้งโค้ดเว็บ, engine, และเอกสารงานที่ต้องใช้ต่อข้ามเครื่อง

## ใช้อะไรเป็นตัวหลัก
- โค้ดและ workspace จริง: โฟลเดอร์นี้
- ความรู้ร่วม / memory / handoff: `C:\Users\Win10\Drive\workspace\AI-Project\Vault`

## โครงหลัก
- `web/` - Next.js frontend ของ CraftBikeLab
- `engine/` - สคริปต์, schema, data, automation, และไฟล์ประกอบระบบ
- `.claude/` - ค่า config ของ Claude ที่ใช้กับ workspace นี้
- `CONTEXT_20260429.md` - บริบทงานรวม
- `PROJECT_DOC.md` - เอกสารโปรเจกต์หลัก
- `MASTER_README.md` - ภาพรวมระดับโปรเจกต์
- `SHOP_PIPELINE.md` - flow งานฝั่ง shop / data pipeline

## เริ่มอ่านจากตรงไหน
1. อ่าน [START-HERE.md](START-HERE.md)
2. ถ้าต้องการบริบทกลาง ให้อ่าน Vault ที่ `00-System/AI-BOOTSTRAP.md`
3. ถ้าจะทำงานหน้าเว็บ ให้เข้า `web/`
4. ถ้าจะทำงานข้อมูล/engine ให้เข้า `engine/`

## กติกาสำคัญ
- อย่าเอา `web/node_modules`, `web/.next`, หรือ `.env` เข้า Git
- ถ้าทำงานข้ามเครื่อง ให้เปิด path เดียวกันจาก Google Drive sync folder
- ถ้าแก้ไฟล์สำคัญในโปรเจกต์ ควรเช็ก `git status` ทุกครั้งก่อนปิดงาน

