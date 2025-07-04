"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import { useLocale } from "@/contexts/locale-provider";
import Link from "next/link";
import { heroSlides } from "@/lib/products";
import { ads } from "@/lib/ads";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

type Slide = { image: string; text?: string; alt?: string; dataAiHint?: string };

export default function HeroSection() {
  const { t } = useLocale();
  const slides: Slide[] =
    Array.isArray(ads) && ads.length > 0
      ? ads.map((ad: any) => ({ image: ad.image, text: ad.text }))
      : heroSlides;

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] p-0">
      <Carousel
        className="w-full h-full"
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative w-full h-full min-h-[300px]">
                <Image
                  src={slide.image}
                  alt={slide.text || slide.alt || "slide"}
                  data-ai-hint={slide.dataAiHint}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {slide.text && (
                  <div className="absolute bottom-8 left-0 right-0 text-center text-white text-2xl md:text-4xl font-bold drop-shadow-lg px-4">
                    {slide.text}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-1/2 transform -translate-y-1/2 w-full px-4 md:px-12">
            <CarouselPrevious className="absolute start-4 md:start-12" />
            <CarouselNext className="absolute end-4 md:end-12" />
        </div>
      </Carousel>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
        <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
          {t("hero.title")}
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl drop-shadow-md">
          {t("hero.subtitle")}
        </p>
        <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="#products">{t("hero.cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
