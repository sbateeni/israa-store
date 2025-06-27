'use client';

import { useEffect } from 'react';
import { useCart } from '@/contexts/cart-provider';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { setCartOpen } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Open the cart sheet
    setCartOpen(true);
    // Redirect back to home page after opening the sheet
    // This makes the cart feel like an overlay even when accessed via URL
    router.replace('/'); 
  }, [setCartOpen, router]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <p>Redirecting to your cart...</p>
    </div>
  );
}
