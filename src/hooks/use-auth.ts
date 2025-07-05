import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = localStorage.getItem('dashboardAuthenticated');
        const loginTime = localStorage.getItem('dashboardLoginTime');
        
        if (authenticated === 'true' && loginTime) {
          // التحقق من أن تسجيل الدخول لم ينتهي (24 ساعة)
          const loginTimestamp = parseInt(loginTime);
          const currentTime = Date.now();
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 ساعة
          
          if (currentTime - loginTimestamp < sessionDuration) {
            setIsAuthenticated(true);
          } else {
            // انتهت صلاحية الجلسة
            logout();
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (password: string, storedPassword: string) => {
    if (password === storedPassword) {
      localStorage.setItem('dashboardAuthenticated', 'true');
      localStorage.setItem('dashboardLoginTime', Date.now().toString());
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('dashboardAuthenticated');
    localStorage.removeItem('dashboardLoginTime');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const requireAuth = () => {
    if (isLoading) {
      return false; // لا تزال في حالة التحميل
    }
    
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    
    return true;
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    requireAuth,
  };
} 