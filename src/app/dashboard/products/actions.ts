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
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.enum(['Perfumes', 'Apparel', 'Creams']),
  image: z
    .any()
    .refine((file): file is File => file instanceof File && file.size > 0, "Image is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
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
});


export async function addProduct(prevState: any, formData: FormData) {
  const validatedFields = productSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
    image: formData.get('image'),
    video: formData.get('video'),
    dataAiHint: formData.get('dataAiHint'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the errors below.',
    };
  }

  try {
    const { image, video, ...productData } = validatedFields.data;

    // Upload image
    const imageUrl = await uploadFile(image, 'product-images');

    // Upload video if it exists
    let videoUrl: string | undefined = undefined;
    if (video) {
      videoUrl = await uploadFile(video, 'product-videos');
    }

    const newProductData = {
      ...productData,
      image: imageUrl,
      ...(videoUrl && { video: videoUrl }),
    };

    await addDoc(collection(db, 'products'), newProductData);
    
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
