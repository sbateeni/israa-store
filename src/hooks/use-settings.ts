import { useState, useEffect, useRef } from 'react';

interface SocialLinks {
  whatsapp: string;
  facebook: string;
  instagram: string;
  snapchat: string;
}

interface PasswordSetting {
  dashboardPassword: string;
}

// Cache for settings to prevent multiple API calls
let settingsCache: any = null;
let settingsPromise: Promise<any> | null = null;

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
  const hasLoaded = useRef(false);

  useEffect(() => {
    const fetchSettings = async () => {
      // Prevent multiple simultaneous requests
      if (settingsPromise) {
        try {
          const data = await settingsPromise;
          if (!hasLoaded.current) {
            setSocialLinks({
              whatsapp: data.whatsapp || "",
              facebook: data.facebook || "",
              instagram: data.instagram || "",
              snapchat: data.snapchat || "",
            });
            setDashboardPassword(data.dashboardPassword || "");
            hasLoaded.current = true;
            setLoading(false);
          }
          return;
        } catch (err) {
          console.error('Error from cached promise:', err);
        }
      }

      // Use cached data if available
      if (settingsCache && !hasLoaded.current) {
        setSocialLinks({
          whatsapp: settingsCache.whatsapp || "",
          facebook: settingsCache.facebook || "",
          instagram: settingsCache.instagram || "",
          snapchat: settingsCache.snapchat || "",
        });
        setDashboardPassword(settingsCache.dashboardPassword || "");
        hasLoaded.current = true;
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching settings from API...');
        
        // Create a single promise for all concurrent requests
        settingsPromise = fetch('/api/settings', { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }).then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Settings loaded from API:', data);
          
          // Cache the result
          settingsCache = data;
          
          return data;
        });
        
        const data = await settingsPromise;
        
        if (!hasLoaded.current) {
          setSocialLinks({
            whatsapp: data.whatsapp || "",
            facebook: data.facebook || "",
            instagram: data.instagram || "",
            snapchat: data.snapchat || "",
          });
          setDashboardPassword(data.dashboardPassword || "");
          hasLoaded.current = true;
          
          console.log('Settings state updated:', {
            socialLinks: {
              whatsapp: data.whatsapp || "",
              facebook: data.facebook || "",
              instagram: data.instagram || "",
              snapchat: data.snapchat || "",
            },
            dashboardPassword: data.dashboardPassword || ""
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      } finally {
        setLoading(false);
        settingsPromise = null; // Reset promise after completion
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
        // Update cache
        settingsCache = { ...settingsCache, ...links };
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
        // Update cache
        settingsCache = { ...settingsCache, dashboardPassword: password };
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
    if (type === 'whatsapp') {
      // إذا كان الرابط يحتوي على wa.me فهو محفوظ بالفعل
      if (value.includes('wa.me')) {
        return value;
      }
      // إذا كان رقم فقط، أضف wa.me
      if (value.match(/^\d+$/)) {
        return `https://wa.me/${value}`;
      }
      // إذا كان يحتوي على + أو - أو مسافات، نظفه أولاً
      const cleanNumber = value.replace(/[\s+\-()]/g, '');
      if (cleanNumber.match(/^\d+$/)) {
        return `https://wa.me/${cleanNumber}`;
      }
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