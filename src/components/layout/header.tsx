"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/locale-provider";
import Logo from "../icons/logo";
import { Globe, Menu, Moon, Sun, X, Settings } from "lucide-react";
import { useTheme } from "@/contexts/theme-provider";
import CartIcon from "../cart/cart-icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useState } from "react";

export default function Header() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#about", label: t("nav.about") },
    { href: "#products", label: t("nav.products") },
    { href: "#testimonials", label: t("nav.testimonials") },
    { href: "#contact", label: t("nav.contact") },
  ];

  const NavItems = () => (
    <>
      {navLinks.map((link) => (
        <Button key={link.href} variant="ghost" asChild>
          <Link href={link.href} onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
        </Button>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="font-bold font-headline">{t("appName")}</span>
          </Link>
        </div>
        
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center gap-2 mb-6" onClick={() => setMobileMenuOpen(false)}>
                <Logo className="w-8 h-8 text-primary" />
                <span className="font-bold font-headline">{t("appName")}</span>
              </Link>
              <div className="flex flex-col space-y-2">
                <NavItems />
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Settings className="h-4 w-4 ml-2" />
                    لوحة التحكم
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <Logo className="w-8 h-8 text-primary" />
            <span className="font-bold font-headline">{t("appName")}</span>
          </Link>
          <nav className="hidden md:flex gap-4">
            <NavItems />
          </nav>
          <div className="flex items-center gap-2">
            <CartIcon />
            
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login" title="لوحة التحكم">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLocale('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('ar')}>العربية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
