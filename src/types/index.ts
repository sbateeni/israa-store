export type ProductCategory = 'Perfumes' | 'Apparel' | 'Creams';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  video?: string;
  dataAiHint?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type Testimonial = {
  quote: string;
  author: string;
};
