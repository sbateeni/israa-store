"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/locale-provider";
import Logo from "../icons/logo";
import { Button } from "../ui/button";
import { Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const { t } = useLocale();

  const navLinks = [
    { href: "#about", label: t("nav.about") },
    { href: "#products", label: t("nav.products") },
    { href: "#contact", label: t("nav.contact") },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-10 h-10 text-primary" />
              <span className="text-xl font-bold font-headline">{t("appName")}</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t("footer.copyright")}</p>
          </div>

          <div className="flex gap-6">
            {navLinks.map((link) => (
              <Button key={link.href} variant="link" asChild className="text-secondary-foreground">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="#" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
