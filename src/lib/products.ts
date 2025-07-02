import type { Product } from "@/types";

// Note: This file now serves as a fallback or for initial data.
// All active product management is now handled through the dashboard and Firebase.
export const products: Product[] = [
  // سيتم توليد المنتجات تلقائيًا من ملف JSON
];

export const testimonials: Testimonial[] = [
    {
        quote: "Wonderful products and excellent service!",
        author: "Sarah",
    },
    {
        quote: "The best store for perfumes and clothing, I recommend everyone to try it.",
        author: "Ahmed",
    },
    {
        quote: "Fast delivery and high quality. I am very satisfied.",
        author: "Layla",
    },
];

export const heroSlides = [
    {
        image: "https://placehold.co/1200x600.png",
        alt: "Luxury perfume collection",
        dataAiHint: "luxury perfume"
    },
    {
        image: "https://placehold.co/1200x600.png",
        alt: "Elegant modern apparel",
        dataAiHint: "fashion model"
    },
    {
        image: "https://placehold.co/1200x600.png",
        alt: "Perfume and apparel together",
        dataAiHint: "stylish outfit"
    },
]
