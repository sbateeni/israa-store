"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyPassword } from "@/lib/products";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        localStorage.setItem("israa_dashboard_auth", "1");
        router.push("/dashboard");
      } else {
        setError("كلمة المرور غير صحيحة");
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setError("حدث خطأ في التحقق من كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-80 space-y-4">
        <h1 className="text-xl font-bold mb-4 text-center">تسجيل الدخول للوحة التحكم</h1>
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded w-full p-2"
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button 
          type="submit" 
          className="bg-blue-600 text-white w-full py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "جاري التحقق..." : "دخول"}
        </button>
      </form>
    </div>
  );
} 