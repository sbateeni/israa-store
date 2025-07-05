import { useState, useEffect } from 'react';

interface PasswordData {
  password: string;
  message: string;
}

export function useDashboardPassword() {
  const [password, setPassword] = useState<string>("israa2025"); // كلمة المرور الافتراضية
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  // جلب كلمة المرور من Vercel Blob Storage
  const fetchPassword = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard-password', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PasswordData = await response.json();
      console.log('Password loaded:', data);
      
      setPassword(data.password);
      setMessage(data.message);
      
    } catch (err) {
      console.error('Error fetching password:', err);
      setError(err instanceof Error ? err.message : 'خطأ في جلب كلمة المرور');
      // استخدام كلمة المرور الافتراضية في حالة الخطأ
      setPassword("israa2025");
    } finally {
      setLoading(false);
    }
  };

  // تحديث كلمة المرور في Vercel Blob Storage
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ password: newPassword }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Password update result:', result);
      
      if (result.success) {
        setPassword(newPassword);
        setMessage('تم تحديث كلمة المرور بنجاح');
        return true;
      } else {
        throw new Error(result.error || 'فشل تحديث كلمة المرور');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'خطأ في تحديث كلمة المرور');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // جلب كلمة المرور عند تحميل المكون
  useEffect(() => {
    fetchPassword();
  }, []);

  return {
    password,
    loading,
    error,
    message,
    updatePassword,
    refreshPassword: fetchPassword,
  };
} 