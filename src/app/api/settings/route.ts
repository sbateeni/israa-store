import { NextRequest, NextResponse } from "next/server";

const BLOB_API_URL = "https://api.vercel.com/v2/blob";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_3rYI5trXqmi2Rgmd_40mfx02cgDWi0OdNFlLEf8fa1ZTQXi";
const SETTINGS_BLOB_KEY = "site-settings.json";

export async function GET() {
  try {
    // محاولة جلب الإعدادات من Blob Storage
    const res = await fetch(`${BLOB_API_URL}/list?prefix=${SETTINGS_BLOB_KEY}`, {
      headers: {
        Authorization: `Bearer ${BLOB_TOKEN}`,
      },
    });

    if (!res.ok) {
      // إذا لم توجد إعدادات، إرجاع الإعدادات الافتراضية
      return NextResponse.json({
        whatsapp: "966500000000",
        facebook: "",
        instagram: "",
        snapchat: "",
      });
    }

    const data = await res.json();
    const settingsBlob = data.blobs?.find((blob: any) => blob.pathname === SETTINGS_BLOB_KEY);

    if (!settingsBlob) {
      // إذا لم توجد إعدادات، إرجاع الإعدادات الافتراضية
      return NextResponse.json({
        whatsapp: "966500000000",
        facebook: "",
        instagram: "",
        snapchat: "",
      });
    }

    // جلب محتوى ملف الإعدادات
    const settingsRes = await fetch(settingsBlob.url);
    if (!settingsRes.ok) {
      throw new Error("فشل جلب الإعدادات");
    }

    const settings = await settingsRes.json();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    // في حالة الخطأ، إرجاع الإعدادات الافتراضية
    return NextResponse.json({
      whatsapp: "966500000000",
      facebook: "",
      instagram: "",
      snapchat: "",
    });
  }
} 