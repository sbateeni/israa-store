"use client";

import { useLocale } from "@/contexts/locale-provider";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TestimonialsSection() {
  const { t } = useLocale();
  const { toast } = useToast();
  const staticTestimonials = t("testimonials.data") as unknown as { quote: string; author: string }[];

  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [userTestimonials, setUserTestimonials] = useState<{ quote: string; author: string }[]>([]);

  // Load testimonials from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("userTestimonials");
    if (saved) setUserTestimonials(JSON.parse(saved));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("userTestimonials", JSON.stringify(userTestimonials));
  }, [userTestimonials]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim()) return;
    setUserTestimonials([{ quote, author: name || t("testimonials.anonymous") }, ...userTestimonials]);
    setName("");
    setQuote("");
    toast({
      title: "شكرًا لمشاركتك رأيك!",
      description: "تم استلام رأيك وسيتم عرضه بعد المراجعة.",
    });
  };

  const testimonials = [...userTestimonials, ...staticTestimonials];

  return (
    <section id="testimonials" className="bg-secondary">
      <div className="container">
        <h2 className="text-3xl font-headline font-bold text-center mb-8">
          {t("testimonials.title")}
        </h2>
        {/* نموذج إضافة رأي */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8 bg-background p-6 rounded-lg shadow flex flex-col gap-4">
          <input
            type="text"
            placeholder={t("contact.name") + " (اختياري)"}
            className="input input-bordered"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <textarea
            placeholder={t("testimonials.addPlaceholder")}
            className="input input-bordered min-h-[80px]"
            value={quote}
            onChange={e => setQuote(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary self-end">
            {t("testimonials.addBtn")}
          </button>
        </form>
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
