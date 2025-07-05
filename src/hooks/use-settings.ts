import { useState, useEffect } from 'react';

interface SiteSettings {
  whatsapp: string;
  facebook: string;
  instagram: string;
  snapchat: string;
  dashboardPassword: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp: "",
    facebook: "",
    instagram: "",
    snapchat: "",
    dashboardPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/settings', {
          cache: 'no-store', // منع التخزين المؤقت
        });
        
        if (!response.ok) {
          throw new Error('فشل جلب الإعدادات');
        }
        
        const data = await response.json();
        console.log('Settings loaded in hook:', data);
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // دالة لتنسيق روابط التواصل الاجتماعي
  const formatSocialLink = (type: 'whatsapp' | 'facebook' | 'instagram' | 'snapchat'): string | undefined => {
    const value = settings[type];
    if (!value) return undefined;
    
    // تنسيق رابط واتساب
    if (type === 'whatsapp' && value && !value.startsWith('http')) {
      return `https://wa.me/${value}`;
    }
    
    return value;
  };

  return {
    settings,
    loading,
    error,
    formatSocialLink,
  };
} 