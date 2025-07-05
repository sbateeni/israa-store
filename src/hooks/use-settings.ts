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
        
        console.log('Fetching settings from API...');
        const response = await fetch('/api/settings', { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Settings loaded from API:', data);
        
        setSocialLinks({
          whatsapp: data.whatsapp || "",
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          snapchat: data.snapchat || "",
        });
        setDashboardPassword(data.dashboardPassword || "");
        
        console.log('Settings state updated:', {
          socialLinks: {
            whatsapp: data.whatsapp || "",
            facebook: data.facebook || "",
            instagram: data.instagram || "",
            snapchat: data.snapchat || "",
          },
          dashboardPassword: data.dashboardPassword || ""
        });
      } catch (err) {
        console.error('Error fetching settings:', err);
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
      console.log('Saving social links:', links);
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ ...links }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Social links save result:', result);
      
      if (result.success) {
        setSocialLinks(links);
        console.log('Social links updated in state:', links);
        return true;
      } else {
        throw new Error(result.error || 'فشل حفظ روابط التواصل');
      }
    } catch (err) {
      console.error('Error saving social links:', err);
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
      console.log('Saving dashboard password...');
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ dashboardPassword: password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Password save result:', result);
      
      if (result.success) {
        setDashboardPassword(password);
        console.log('Password updated in state');
        return true;
      } else {
        throw new Error(result.error || 'فشل حفظ كلمة المرور');
      }
    } catch (err) {
      console.error('Error saving password:', err);
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
    
    // تنسيق رابط واتساب
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