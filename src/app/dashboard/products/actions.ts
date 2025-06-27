'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.enum(['Perfumes', 'Apparel', 'Creams']),
  image: z.string().url('Please enter a valid image URL.'),
  dataAiHint: z.string().optional(),
});

export async function addProduct(prevState: any, formData: FormData) {
  try {
    const validatedFields = productSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      category: formData.get('category'),
      image: formData.get('image'),
      dataAiHint: formData.get('dataAiHint'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Please correct the errors below.',
      };
    }

    await addDoc(collection(db, 'products'), validatedFields.data);
    
  } catch (error) {
    console.error('Error adding product:', error);
    return {
      message: 'An unexpected error occurred. Could not add product.',
      errors: {},
    };
  }

  revalidatePath('/dashboard/products');
  revalidatePath('/');
  redirect('/dashboard/products');
}
