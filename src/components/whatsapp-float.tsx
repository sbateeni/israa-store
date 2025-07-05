"use client";

import { Button } from "./ui/button";
import { useSettings } from "@/hooks/use-settings";

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
)

export default function WhatsAppFloat() {
  const { formatSocialLink } = useSettings();
  const whatsappLink = formatSocialLink('whatsapp');

  // إذا لم تكن هناك إعدادات واتساب، لا تعرض الأيقونة
  if (!whatsappLink) {
    return null;
  }

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-6 end-6 z-50"
    >
        <Button size="icon" className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg">
            <WhatsAppIcon />
        </Button>
    </a>
  );
}
