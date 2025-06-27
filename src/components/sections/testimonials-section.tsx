"use client";

import { useLocale } from "@/contexts/locale-provider";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const { t } = useLocale();
  const testimonials = t("testimonials.data") as unknown as { quote: string; author: string }[];

  return (
    <section id="testimonials" className="bg-secondary">
      <div className="container">
        <h2 className="text-3xl font-headline font-bold text-center mb-8">
          {t("testimonials.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col">
              <CardContent className="pt-6 flex-grow">
                <div className="flex gap-1 text-primary mb-2">
                    <Star fill="currentColor" className="w-5 h-5"/>
                    <Star fill="currentColor" className="w-5 h-5"/>
                    <Star fill="currentColor" className="w-5 h-5"/>
                    <Star fill="currentColor" className="w-5 h-5"/>
                    <Star fill="currentColor" className="w-5 h-5"/>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              </CardContent>
              <CardFooter>
                <p className="font-bold">- {testimonial.author}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
