'use server';

import { z } from 'zod';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.enum(['Perfumes', 'Apparel', 'Creams']),
  image: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'Image is required.')
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      `Max image size is 5MB.`
    )
});

type FormState = {
    message: string;
    productCode?: string;
    isSuccess: boolean;
    errors?: {
        name?: string[];
        description?: string[];
        price?: string[];
        category?: string[];
        image?: string[];
    }
}

export async function createProductCode(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = productSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        category: formData.get('category'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Please correct the errors below.',
            isSuccess: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, description, price, category, image } = validatedFields.data;

    try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExtension = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = join(process.cwd(), 'public', 'products', fileName);

        await writeFile(filePath, buffer);

        const imagePath = `/products/${fileName}`;
        
        const productCode = `  {
    id: "${uuidv4().substring(0,8)}",
    name: "${name.replace(/"/g, '\\"')}",
    description: "${description.replace(/"/g, '\\"')}",
    price: ${price},
    category: "${category}",
    image: "${imagePath}",
    dataAiHint: "user uploaded"
  },`;

        return {
            message: 'Success! Copy the code below and add it to your products file.',
            isSuccess: true,
            productCode: productCode,
        };

    } catch (error) {
        console.error('Failed to process product:', error);
        return {
            message: 'An unexpected error occurred while processing the image. Please try again.',
            isSuccess: false,
        };
    }
}
