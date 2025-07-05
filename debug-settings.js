// تشخيص مشكلة رابط واتساب
const BLOB_API_URL = "https://api.vercel.com/v2/blob";
const BLOB_TOKEN = "vercel_blob_rw_3rYI5trXqmi2Rgmd_40mfx02cgDWi0OdNFlLEf8fa1ZTQXi";
const SOCIAL_BLOB_KEY = "social-links.json";

async function debugWhatsApp() {
  console.log('🔍 تشخيص مشكلة رابط واتساب');
  
  try {
    // 1. التحقق من البيانات المحفوظة في Vercel Blob Storage
    console.log('\n📥 جلب البيانات من Vercel Blob Storage...');
    const socialRes = await fetch(`${BLOB_API_URL}/get?pathname=${SOCIAL_BLOB_KEY}`, { 
      headers: { Authorization: `Bearer ${BLOB_TOKEN}` } 
    });

    console.log('📊 حالة الاستجابة:', socialRes.status);

    if (socialRes.ok) {
      const socialData = await socialRes.json();
      console.log('✅ البيانات المحفوظة:', socialData);
      
      if (socialData.whatsapp) {
        console.log('📱 رقم واتساب محفوظ:', socialData.whatsapp);
        console.log('🔗 رابط واتساب كامل:', `https://wa.me/${socialData.whatsapp}`);
        
        // اختبار الرابط
        console.log('🧪 اختبار الرابط...');
        const testUrl = `https://wa.me/${socialData.whatsapp}`;
        console.log('🔗 الرابط النهائي:', testUrl);
        
        // التحقق من صحة الرقم
        if (socialData.whatsapp.match(/^\d+$/)) {
          console.log('✅ الرقم صحيح (أرقام فقط)');
        } else {
          console.log('❌ الرقم غير صحيح (يحتوي على أحرف أخرى)');
        }
      } else {
        console.log('⚠️ لم يتم تعيين رقم واتساب');
      }
    } else {
      console.log('❌ لم يتم العثور على ملف روابط التواصل');
    }

    // 2. اختبار API الموقع
    console.log('\n🌐 اختبار API الموقع...');
    try {
      const siteRes = await fetch('https://israa-store.vercel.app/api/settings');
      console.log('📊 حالة استجابة API الموقع:', siteRes.status);
      
      if (siteRes.ok) {
        const siteData = await siteRes.json();
        console.log('✅ بيانات API الموقع:', siteData);
        
        if (siteData.whatsapp) {
          console.log('📱 رقم واتساب من API:', siteData.whatsapp);
          console.log('🔗 رابط واتساب من API:', `https://wa.me/${siteData.whatsapp}`);
        } else {
          console.log('⚠️ لم يتم تعيين رقم واتساب في API');
        }
      } else {
        console.log('❌ فشل في جلب بيانات API الموقع');
      }
    } catch (error) {
      console.log('❌ خطأ في الاتصال بـ API الموقع:', error.message);
    }

    // 3. إنشاء بيانات تجريبية صحيحة
    console.log('\n💾 إنشاء بيانات تجريبية صحيحة...');
    const testSocial = {
      whatsapp: "966500000000",
      facebook: "https://facebook.com/test",
      instagram: "https://instagram.com/test",
      snapchat: "https://snapchat.com/add/test"
    };

    console.log('📝 البيانات التجريبية:', testSocial);
    console.log('🔗 رابط واتساب التجريبي:', `https://wa.me/${testSocial.whatsapp}`);

    // حفظ البيانات التجريبية
    const { put } = await import('@vercel/blob');
    const socialBlob = new Blob([JSON.stringify(testSocial, null, 2)], { type: "application/json" });
    
    console.log('💾 حفظ البيانات التجريبية...');
    const socialResult = await put(SOCIAL_BLOB_KEY, socialBlob, { 
      access: 'public', 
      token: BLOB_TOKEN,
      allowOverwrite: true 
    });
    console.log('✅ تم حفظ البيانات التجريبية:', socialResult.url);

    console.log('\n📋 التعليمات:');
    console.log('1. انتقل إلى: https://israa-store.vercel.app/dashboard');
    console.log('2. اختر تبويب "روابط التواصل"');
    console.log('3. يجب أن ترى الرقم: 966500000000');
    console.log('4. اضغط "حفظ روابط التواصل"');
    console.log('5. تحقق من أيقونة واتساب في الموقع');

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  }
}

debugWhatsApp(); 