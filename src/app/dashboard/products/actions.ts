'use server';

import { z } from 'zod';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// Helper function to upload file and get URL
async function uploadFile(file: File, path: string): Promise<string> {
    const fileRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}

const productSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number.').optional().or(z.literal('')),
  category: z.enum(['Perfumes', 'Apparel', 'Creams']).optional().or(z.literal('')),
  image: z
    .any()
    .transform(file => (file instanceof File && file.size > 0 ? file : undefined))
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
  video: z
    .any()
    .transform(file => (file instanceof File && file.size > 0 ? file : undefined))
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max video size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_VIDEO_TYPES.includes(file.type),
      'Only .mp4, .webm, and .ogg formats are supported for videos.'
    ),
  dataAiHint: z.string().optional(),
  instagram: z.string().url("Must be a valid URL").or(z.literal('')).optional().transform(e => e === "" ? undefined : e),
  twitter: z.string().url("Must be a valid URL").or(z.literal('')).optional().transform(e => e === "" ? undefined : e),
  facebook: z.string().url("Must be a valid URL").or(z.literal('')).optional().transform(e => e === "" ? undefined : e),
});


export async function addProduct(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the errors below.',
      values,
    };
  }

  try {
    const { image, video, ...productData } = validatedFields.data;

    // Upload image if it exists
    let imageUrl: string | undefined = undefined;
    if (image) {
      imageUrl = await uploadFile(image, 'product-images');
    }

    // Upload video if it exists
    let videoUrl: string | undefined = undefined;
    if (video) {
      videoUrl = await uploadFile(video, 'product-videos');
    }

    const newProductData = {
      name: productData.name || "Untitled Product",
      description: productData.description || "No description provided.",
      price: productData.price || 0,
      category: productData.category || "Perfumes",
      image: imageUrl || "https://placehold.co/600x600.png",
      ...(videoUrl && { video: videoUrl }),
      dataAiHint: productData.dataAiHint,
      instagram: productData.instagram,
      twitter: productData.twitter,
      facebook: productData.facebook,
    };

    await addDoc(collection(db, 'products'), newProductData);
    
  } catch (error) {
    console.error('Error adding product:', error);
    return {
      message: 'An unexpected error occurred. Could not add product.',
      errors: {},
      values,
    };
  }

  revalidatePath('/dashboard/products');
  revalidatePath('/');
  redirect('/dashboard/products');
}
