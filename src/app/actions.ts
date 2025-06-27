"use server";

import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export async function submitContactForm(prevState: any, formData: FormData) {
  try {
    const validatedFields = contactSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Please correct the errors below.',
        isSuccess: false,
      };
    }

    // In a real application, you would send an email here.
    // e.g., await sendEmail(validatedFields.data);
    console.log('New contact form submission:', validatedFields.data);

    return {
      message: `Thank you, ${validatedFields.data.name}! Your message has been sent.`,
      errors: {},
      isSuccess: true,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An unexpected error occurred. Please try again later.',
      errors: {},
      isSuccess: false,
    };
  }
}
