import { useState, useEffect } from 'react';

interface SocialLinks {
  whatsapp: string;
  facebook: string;
  instagram: string;
  snapchat: string;
}

interface PasswordSetting {
  dashboardPassword: string;
}

export function useSettings() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    whatsapp: "",
    facebook: "",
    instagram: "",
    snapchat: "",
  });
  const [dashboardPassword, setDashboardPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/settings', { cache: 'no-store' });
        if (!response.ok) throw new Error('فشل جلب الإعدادات');
        const data = await response.json();
        setSocialLinks({
          whatsapp: data.whatsapp || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          snapchat: data.snapchat || "",
        });
        setDashboardPassword(data.dashboardPassword || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // تحديث روابط التواصل فقط
  const saveSocialLinks = async (links: SocialLinks) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...links }),
      });
      if (!response.ok) throw new Error('فشل حفظ روابط التواصل');
      setSocialLinks(links);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // تحديث كلمة المرور فقط
  const saveDashboardPassword = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardPassword: password }),
      });
      if (!response.ok) throw new Error('فشل حفظ كلمة المرور');
      setDashboardPassword(password);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // دالة لتنسيق روابط التواصل الاجتماعي
  const formatSocialLink = (type: keyof SocialLinks): string | undefined => {
    const value = socialLinks[type];
    if (!value) return undefined;
    if (type === 'whatsapp' && value && !value.startsWith('http')) {
      return `https://wa.me/${value}`;
    }
    return value;
  };

  return {
    socialLinks,
    dashboardPassword,
    loading,
    error,
    formatSocialLink,
    saveSocialLinks,
    saveDashboardPassword,
  };
} 