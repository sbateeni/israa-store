// سكريبت إدارة socials.ts دون رفعه إلى GitHub
const fs = require('fs');
const path = require('path');

const socialsPath = path.join(__dirname, 'src', 'lib', 'socials.ts');
const jsonPath = path.join(__dirname, 'socials.json');

// إذا وجد ملف socials.json استخدمه، وإلا استخدم كائن افتراضي
let socials = {
  facebook: "https://facebook.com/yourpage",
  instagram: "https://instagram.com/yourpage",
  snapchat: "https://snapchat.com/add/yourpage",
  whatsapp: "https://wa.me/1234567890",
  tiktok: "https://www.tiktok.com/@yourpage"
};

if (fs.existsSync(jsonPath)) {
  try {
    const data = fs.readFileSync(jsonPath, 'utf8');
    socials = JSON.parse(data);
  } catch (e) {
    console.error('⚠️  خطأ في قراءة socials.json:', e.message);
  }
}

// دعم إضافة أو حذف رابط عبر argv
const [,, action, key, value] = process.argv;
if (action === 'add' && key && value) {
  socials[key] = value;
  console.log(`تمت إضافة/تحديث ${key}`);
} else if (action === 'delete' && key) {
  delete socials[key];
  console.log(`تم حذف ${key}`);
}

// احفظ التغييرات في socials.json
fs.writeFileSync(jsonPath, JSON.stringify(socials, null, 2), 'utf8');

// أنشئ/حدث ملف socials.ts
const content =
  "export const socials = " +
  JSON.stringify(socials, null, 2) +
  ";\n";
fs.writeFileSync(socialsPath, content, 'utf8');

console.log('✅ تم تحديث ملف socials.ts بنجاح!'); 