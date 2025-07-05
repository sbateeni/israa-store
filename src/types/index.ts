export type ProductCategory = 'Perfumes' | 'Apparel' | 'Creams';

export type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  image?: string;
  images?: { url: string; isMain: boolean }[];
  video?: string;
  dataAiHint?: string;
  instagram?: string;
  facebook?: string;
  snapchat?: string;
  whatsapp?: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type Testimonial = {
  quote: string;
  author: string;
};
