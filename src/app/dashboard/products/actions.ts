'use server';

import { z } from 'zod';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
    isSuccess: boolean;
    errors?: {
        name?: string[];
        description?: string[];
        price?: string[];
        category?: string[];
        image?: string[];
    }
}

export async function addProduct(prevState: FormState, formData: FormData): Promise<FormState> {
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
        
        const productsFilePath = join(process.cwd(), 'src', 'lib', 'products.ts');
        const fileContent = await readFile(productsFilePath, 'utf-8');

        const newProductObjectString = `  {
    id: "${uuidv4().substring(0, 8)}",
    name: "${name.replace(/"/g, '\\"')}",
    description: "${description.replace(/"/g, '\\"')}",
    price: ${price},
    category: "${category}",
    image: "${imagePath}",
    dataAiHint: "user uploaded"
  }`;

        const productsRegex = /(export const products: Product\[\] = \[)([\s\S]*?)(\];)/;
        const match = fileContent.match(productsRegex);

        if (!match) {
            throw new Error("Could not match the products array structure in src/lib/products.ts. Please ensure it is defined as 'export const products: Product[] = [...]'.");
        }

        const arrayStart = match[1];
        let arrayContent = match[2].trim();
        const arrayEnd = match[3];

        if (arrayContent && !arrayContent.endsWith(',')) {
            arrayContent += ',';
        }

        const newArrayContent = `${arrayContent}\n${newProductObjectString}`;
        const updatedArrayString = `${arrayStart}\n${newArrayContent}\n${arrayEnd}`;
        const updatedFileContent = fileContent.replace(productsRegex, updatedArrayString);
        
        await writeFile(productsFilePath, updatedFileContent, 'utf-8');

    } catch (error) {
        console.error('Failed to process product:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return {
            message: `An unexpected error occurred: ${errorMessage}`,
            isSuccess: false,
        };
    }

    revalidatePath('/dashboard/products');
    revalidatePath('/');
    redirect('/dashboard/products');
}