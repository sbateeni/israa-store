
'use server';

import { z } from 'zod';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
  price: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.coerce.number({invalid_type_error: "Price must be a number."}).min(0, 'Price must be a positive number.').optional()
  ),
  category: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.enum(['Perfumes', 'Apparel', 'Creams']).optional()
  ),
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
    
  } catch (error: any) {
    console.error('Error adding product:', error);
    
    let errorMessage = 'An unexpected error occurred. Could not add product.';
    if (error.code === 'permission-denied') {
        errorMessage = 'Permission to add product was denied. Please check your Firebase security rules to allow write operations.';
    } else if (error.code === 'storage/unknown' || error.code === 'storage/object-not-found') {
        errorMessage = 'A Firebase Storage error occurred. This is often caused by incorrect Security Rules or CORS configuration. Please check your Firebase Storage **Rules** tab first to ensure it allows write operations. If rules are correct, then check your CORS settings.';
    } else if (error.message) {
        errorMessage = `An error occurred: ${error.message}`;
    }

    return {
      message: errorMessage,
      errors: {},
      values,
    };
  }

  revalidatePath('/dashboard/products');
  revalidatePath('/');
  redirect('/dashboard/products');
}

export async function deleteProduct(productId: string) {
  if (!productId) {
    return { success: false, message: 'Product ID is missing.' };
  }

  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return { success: false, message: 'Product not found in database.' };
    }

    const productData = productSnap.data();

    // Delete image from storage if it exists and is not a placeholder
    if (productData.image && !productData.image.includes('placehold.co')) {
      try {
        const imageRef = ref(storage, productData.image);
        await deleteObject(imageRef);
      } catch (storageError: any) {
        if (storageError.code !== 'storage/object-not-found') {
          console.warn(`Could not delete image from storage: ${storageError.message}`);
        }
      }
    }
    
    // Delete video from storage if it exists
    if (productData.video) {
       try {
        const videoRef = ref(storage, productData.video);
        await deleteObject(videoRef);
      } catch (storageError: any) {
         if (storageError.code !== 'storage/object-not-found') {
            console.warn(`Could not delete video from storage: ${storageError.message}`);
         }
      }
    }

    await deleteDoc(productRef);

    revalidatePath('/dashboard/products');
    revalidatePath('/');
    return { success: true, message: 'Product deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}

const updateProductSchema = productSchema.extend({
  productId: z.string().min(1, "Product ID is required."),
  currentImageUrl: z.string().optional(),
  currentVideoUrl: z.string().optional(),
});


export async function updateProduct(prevState: any, formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = updateProductSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please correct the errors below.',
            values,
        };
    }
    
    const { productId, currentImageUrl, currentVideoUrl, image, video, ...productData } = validatedFields.data;
    
    try {
        const productRef = doc(db, 'products', productId);

        let imageUrl: string | undefined = currentImageUrl;
        if (image) {
            imageUrl = await uploadFile(image, 'product-images');
            // Delete old image if it exists and is not a placeholder or a local file path
            if (currentImageUrl && !currentImageUrl.includes('placehold.co') && currentImageUrl.startsWith('https://firebasestorage.googleapis.com')) {
                try {
                    const oldImageRef = ref(storage, currentImageUrl);
                    await deleteObject(oldImageRef);
                } catch (e: any) {
                    if (e.code !== 'storage/object-not-found') console.warn("Could not delete old image:", e);
                }
            }
        }

        let videoUrl: string | undefined = currentVideoUrl;
        if (video) {
            videoUrl = await uploadFile(video, 'product-videos');
            if (currentVideoUrl) {
                try {
                    const oldVideoRef = ref(storage, currentVideoUrl);
                    await deleteObject(oldVideoRef);
                } catch(e: any) {
                     if (e.code !== 'storage/object-not-found') console.warn("Could not delete old video:", e);
                }
            }
        } else if (values.video === null && currentVideoUrl) {
            // Video was removed
            videoUrl = undefined;
        }

        const dataToUpdate: { [key: string]: any } = {
            name: productData.name || "Untitled Product",
            description: productData.description || "No description provided.",
            price: productData.price || 0,
            category: productData.category || "Perfumes",
            image: imageUrl || "https://placehold.co/600x600.png",
            dataAiHint: productData.dataAiHint,
            instagram: productData.instagram,
            twitter: productData.twitter,
            facebook: productData.facebook,
        };

        if(videoUrl) {
            dataToUpdate.video = videoUrl;
        }

        await updateDoc(productRef, dataToUpdate);

    } catch (error: any) {
        console.error('Error updating product:', error);
        return {
            message: `An unexpected error occurred: ${error.message}`,
            errors: {},
            values,
        };
    }

    revalidatePath('/dashboard/products');
    revalidatePath('/');
    redirect('/dashboard/products');
}
