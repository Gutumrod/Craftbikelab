# START HERE

ไฟล์นี้คือจุดเริ่มต้นสำหรับทำงานกับ CraftBikeLab บนทุกเครื่อง

## อ่านตามลำดับนี้
1. `README.md`
2. `PROJECT_DOC.md`
3. `MASTER_README.md`
4. `SHOP_PIPELINE.md`
5. ถ้างานเกี่ยวกับหน้าเว็บ ให้เข้า `web/README.md`
6. ถ้างานเกี่ยวกับข้อมูล/automation ให้เข้า `engine/`

## ทำงานบนเครื่องนี้
### งานเว็บ
```bash
cd web
npm install
npm run dev
```

### งานตรวจสถานะ repo
```bash
git status
```

## ทำงานข้ามเครื่อง
- ใช้โฟลเดอร์นี้ผ่าน Google Drive sync path เดียวกัน
- อย่าใช้ Desktop copy หรือไฟล์ชั่วคราวเป็นตัวหลัก
- ความจำกลางและ handoff ให้ดูที่ Vault เสมอ

## ห้ามลืม
- ไม่ commit `node_modules`
- ไม่ commit `.next`
- ไม่ commit `.env`
- ถ้าไม่แน่ใจ ให้เปิดไฟล์จริงก่อนแก้

