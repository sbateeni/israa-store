import type { Product, Testimonial } from "@/types";

// Note: This file now serves as a fallback or for initial data.
// All active product management is now handled through the dashboard and Firebase.
export const products: Product[] = [
{
    id: "p1",
    name: "Golden Dust",
    description: "An exotic and warm fragrance with hints of amber and vanilla.",
    price: 250,
    category: "Perfumes",
    image: "https://placehold.co/600x600.png",
    dataAiHint: "perfume bottle",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    snapchat: "https://www.snapchat.com/",
    whatsapp: "https://wa.me/"
  },
  {
    id: "p2",
    name: "Midnight Bloom",
    description: "A mysterious floral scent with notes of jasmine and dark musk.",
    price: 275,
    category: "Perfumes",
    image: "https://placehold.co/600x600.png",
    dataAiHint: "luxury perfume"
  },
  {
    id: "p4",
    name: "عطر إيليغانس الفاخر",
    description: "استمتع بتجربة فاخرة مع عطر إيليغانس، الذي يجمع بين عبق الزهور الشرقية ونفحات الفانيليا الدافئة. تصميم الزجاجة الأنيق يعكس رقي العطر وفخامته، ليمنحك حضورًا لا يُنسى في كل مناسبة.",
    price: 150,
    category: "Perfumes",
    image: "/products/3614273069540_.jpg",
    dataAiHint: "elegant perfume bottle",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    snapchat: "https://www.snapchat.com/",
    whatsapp: "https://wa.me/"
  },
  {
    id: "a1",
    name: "Silk Abaya",
    description: "An elegant and flowing abaya made from the finest pure silk.",
    price: 750,
    category: "Apparel",
    image: "https://placehold.co/600x600.png",
    dataAiHint: "elegant dress",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com"
  },
  {
    id: "a2",
    name: "Linen Kaftan",
    description: "A breathable and stylish kaftan, perfect for warm evenings.",
    price: 550,
    category: "Apparel",
    image: "https://placehold.co/600x600.png",
    dataAiHint: "fashion apparel"
  },
  {
    id: "c1",
    name: "Oud Body Cream",
    description: "A rich and moisturizing cream with the deep scent of oud.",
    price: 150,
    category: "Creams",
    image: "https://placehold.co/600x600.png",
    dataAiHint: "cosmetic cream"
  },
  {
    id: "c2",
    name: "Rose & Saffron Hand Lotion",
    description: "A light, fast-absorbing lotion with a delicate floral aroma.",
    price: 120,
    category: "Creams",
    image: "https://placehold.co/600x600.png",
    dataAiHint: "lotion bottle"
  },
  {
    id: "p3",
    name: "Desert Mirage",
    description: "A fresh and spicy scent capturing the essence of a desert oasis.",
    price: 260,
    category: "Perfumes",
    image: "https://placehold.co/600x600.png",
    dataAiHint: "perfume glass"
  },
  {
    id: "a3",
    name: "Embroidered Jalabiya",
    description: "A traditional jalabiya with intricate, handcrafted embroidery.",
    price: 900,
    category: "Apparel",
    image: "https://placehold.co/600x600.png",
    dataAiHint: "traditional clothing"
  },
  {
    id: "31407fb8",
    name: "sbate",
    description: "2123124ثي",
    price: 12,
    category: "Creams",
    image: "/products/198c0877-30d8-4157-ab68-0f9b7e32e5c7.png",
    dataAiHint: "user uploaded"
  }
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
