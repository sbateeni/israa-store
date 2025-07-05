import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    console.log('Password retrieval request received');
    
    // التحقق من أن الطلب يأتي من بيئة آمنة (اختياري)
    const userAgent = req.headers.get('user-agent');
    const referer = req.headers.get('referer');
    
    console.log('Request details:', { userAgent, referer });
    
    // محاولة استرجاع كلمة المرور من Vercel Environment Variables
    try {
      console.log('Attempting to retrieve password from Vercel env...');
      
      // استخدام vercel env pull لاسترجاع كلمة المرور
      const { stdout, stderr } = await execAsync('vercel env pull .env.local', {
        timeout: 30000, // 30 ثانية timeout
        cwd: process.cwd(), // العمل في المجلد الحالي
      });
      
      if (stderr) {
        console.error('Vercel env pull stderr:', stderr);
      }
      
      console.log('Vercel env pull stdout:', stdout);
      
      // قراءة ملف .env.local
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        console.log('Env file content length:', envContent.length);
        
        // البحث عن كلمة المرور في الملف
        const passwordMatch = envContent.match(/DASHBOARD_PASSWORD=(.+)/);
        
        if (passwordMatch && passwordMatch[1]) {
          const password = passwordMatch[1].trim();
          console.log('Password found in env file');
          
          // حذف ملف .env.local بعد قراءته (للأمان)
          try {
            fs.unlinkSync(envPath);
            console.log('Env file deleted for security');
          } catch (deleteError) {
            console.error('Error deleting env file:', deleteError);
          }
          
          return NextResponse.json({
            success: true,
            password: password,
            message: 'تم استرجاع كلمة المرور بنجاح'
          });
        } else {
          console.log('No password found in env file');
          
          // حذف ملف .env.local حتى لو لم نجد كلمة المرور
          try {
            fs.unlinkSync(envPath);
            console.log('Env file deleted even though no password found');
          } catch (deleteError) {
            console.error('Error deleting env file:', deleteError);
          }
          
          return NextResponse.json({
            success: false,
            error: 'لم يتم العثور على كلمة المرور في ملف البيئة'
          }, { status: 404 });
        }
      } else {
        console.log('Env file not found');
        return NextResponse.json({
          success: false,
          error: 'لم يتم العثور على ملف البيئة'
        }, { status: 404 });
      }
      
    } catch (vercelError: any) {
      console.error('Vercel env pull error:', vercelError);
      
      // محاولة بديلة: البحث في process.env
      const dashboardPassword = process.env.DASHBOARD_PASSWORD;
      
      if (dashboardPassword) {
        console.log('Password found in process.env');
        return NextResponse.json({
          success: true,
          password: dashboardPassword,
          message: 'تم استرجاع كلمة المرور من متغيرات البيئة'
        });
      } else {
        console.log('No password found in process.env');
        return NextResponse.json({
          success: false,
          error: 'فشل في استرجاع كلمة المرور من Vercel Environment Variables'
        }, { status: 500 });
      }
    }
    
  } catch (error: any) {
    console.error('Password retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'حدث خطأ أثناء استرجاع كلمة المرور'
    }, { status: 500 });
  }
} 