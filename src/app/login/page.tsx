"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PASSWORD = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || "israa2024"; // يمكنك تغييرها لاحقًا

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem("israa_dashboard_auth", "1");
      router.push("/dashboard");
    } else {
      setError("كلمة المرور غير صحيحة");
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
        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">دخول</button>
      </form>
    </div>
  );
} 