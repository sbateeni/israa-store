'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Copy } from 'lucide-react';
import { createProductCode } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Generating Code...' : 'Generate Product Code'}
    </Button>
  );
}

export default function NewProductPage() {
  const initialState = { message: '', isSuccess: false, errors: {} };
  const [state, formAction] = useActionState(createProductCode, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setPreview(null);
    }
  };

  const handleCopy = () => {
    if (state.productCode) {
      navigator.clipboard.writeText(state.productCode);
      toast({ title: 'Copied!', description: 'Product code copied to clipboard.' });
    }
  };
  
  if (state.isSuccess && state.productCode) {
    return (
        <div className="container py-10">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Product Code Generated Successfully!</CardTitle>
                    <CardDescription>Follow these steps to add your new product to the store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Step 1: Copy the generated code</Label>
                        <div className="relative">
                            <pre className="bg-secondary p-4 rounded-md text-secondary-foreground overflow-x-auto text-sm">
                                <code>{state.productCode}</code>
                            </pre>
                            <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Step 2: Add the code to your products file</Label>
                         <Alert>
                            <AlertTitle>Open File</AlertTitle>
                            <AlertDescription>
                                Navigate to the file <code className="font-mono bg-secondary px-1 py-0.5 rounded">src/lib/products.ts</code> in your editor.
                            </AlertDescription>
                        </Alert>
                        <Alert>
                            <AlertTitle>Paste Code</AlertTitle>
                            <AlertDescription>
                                Find the <code className="font-mono bg-secondary px-1 py-0.5 rounded">products</code> array and paste the copied code inside it.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <Button onClick={() => window.location.reload()} className="w-full">
                        Add Another Product
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>
            This form will upload your image and generate the code snippet to add to your products file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" placeholder="e.g., Golden Dust" required />
              {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="A short, catchy description..." required />
              {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₪)</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="e.g., 250" required />
                {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                 <Select name="category" required>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Perfumes">Perfumes</SelectItem>
                        <SelectItem value="Apparel">Apparel</SelectItem>
                        <SelectItem value="Creams">Creams</SelectItem>
                    </SelectContent>
                </Select>
                {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category[0]}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
               {preview && (
                <div className="mt-2">
                  <Image src={preview} alt="Product preview" width={100} height={100} className="rounded-md object-cover" />
                </div>
              )}
              <Input id="image" name="image" type="file" accept="image/*" required onChange={handleImageChange} />
              {state.errors?.image && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
            </div>
            {!state.isSuccess && state.message && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
