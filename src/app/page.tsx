import AboutSection from "@/components/sections/about-section";
import ContactSection from "@/components/sections/contact-section";
import HeroSection from "@/components/sections/hero-section";
import ProductsSection from "@/components/sections/products-section";
import TestimonialsSection from "@/components/sections/testimonials-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
