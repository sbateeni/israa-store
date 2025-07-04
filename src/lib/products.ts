import type { Product } from "@/types";

// Note: This file now serves as a fallback or for initial data.
// All active product management is now handled through the dashboard and Firebase.

type Testimonial = {
  quote: string;
  author: string;
};

function withDefaultSocials(product: Omit<Product, 'facebook' | 'instagram' | 'snapchat' | 'whatsapp'> & Partial<Pick<Product, 'facebook' | 'instagram' | 'snapchat' | 'whatsapp'>>): Product {
  return {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    snapchat: "https://www.snapchat.com/",
    whatsapp: "https://wa.me/",
    ...product,
  };
}

export const products: Product[] = [
  withDefaultSocials({
    name: "qw",
    description: "fsdgs",
    price: "12.0",
    category: "Apparel",
    id: "2",
    image: "/products/fef30207-aaf0-468f-a7e7-a9d06d8d8bb8-thumbnail-1000x1000-70.jpeg",
    images: ['/products/fef30207-aaf0-468f-a7e7-a9d06d8d8bb8-thumbnail-1000x1000-70.jpeg']
  }),
  withDefaultSocials({
    name: "32hfg",
    description: "dsdf",
    price: "321.0",
    category: "Perfumes",
    id: "3",
    image: "/products/images.jpg",
    images: ['/products/images.jpg']
  }),
  withDefaultSocials({
    name: "efsd",
    description: "123",
    price: "432.0",
    category: "Creams",
    id: "4",
    image: "/products/prada-paradoxe-edp.jpeg",
    images: ['/products/prada-paradoxe-edp.jpeg']
  }),
  withDefaultSocials({
    name: "بسيب",
    description: "ب3",
    price: "555.0",
    category: "Perfumes",
    id: "5",
    image: "/products/fef30207-aaf0-468f-a7e7-a9d06d8d8bb8-thumbnail-1000x1000-70_1.jpeg",
    images: ['/products/fef30207-aaf0-468f-a7e7-a9d06d8d8bb8-thumbnail-1000x1000-70_1.jpeg', '/products/images_1.jpg', '/products/prada-paradoxe-edp_1.jpeg']
  }),
  withDefaultSocials({
    name: "قثضصثق",
    description: "قصضثق",
    price: "444.0",
    category: "Perfumes",
    id: "6",
    image: "/products/AQPbTusC4JTo20-IhLVIvmperio0mo4imd9bde2QVhq4i3UUuzqx5_YQ4RAuvdLm_i8pL6OFMRypflwwuvvMSJH0.mp4",
    images: ['/products/AQPbTusC4JTo20-IhLVIvmperio0mo4imd9bde2QVhq4i3UUuzqx5_YQ4RAuvdLm_i8pL6OFMRypflwwuvvMSJH0.mp4']
  })
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
