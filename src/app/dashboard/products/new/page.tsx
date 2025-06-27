'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { addProduct } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Adding Product...' : 'Add Product'}
        </Button>
    );
}

export default function NewProductPage() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(addProduct, initialState);

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
          <CardTitle>Add a New Product</CardTitle>
          <CardDescription>Fill in the details below to add a new product to your store. All fields are optional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Golden Dust"
                className={cn(state.errors?.name && "border-destructive focus-visible:ring-destructive")}
                defaultValue={state.errors ? state.values?.name : ''}
              />
              {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A short, catchy description..."
                className={cn(state.errors?.description && "border-destructive focus-visible:ring-destructive")}
                defaultValue={state.errors ? state.values?.description : ''}
              />
              {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="price">Price (₪)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 250"
                        className={cn(state.errors?.price && "border-destructive focus-visible:ring-destructive")}
                        defaultValue={state.errors ? state.values?.price : ''}
                    />
                    {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price.join(', ')}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={state.errors ? state.values?.category : ''}>
                        <SelectTrigger id="category" className={cn(state.errors?.category && "border-destructive focus:ring-destructive")}>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Perfumes">Perfumes</SelectItem>
                            <SelectItem value="Apparel">Apparel</SelectItem>
                            <SelectItem value="Creams">Creams</SelectItem>
                        </SelectContent>
                    </Select>
                    {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category.join(', ')}</p>}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className={cn(state.errors?.image && "border-destructive focus-visible:ring-destructive")}
              />
              <p className="text-xs text-muted-foreground">Optional. Max file size: 5MB.</p>
              {state.errors?.image && <p className="text-sm text-destructive">{state.errors.image.join(', ')}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="video">Product Video (Optional)</Label>
              <Input
                id="video"
                name="video"
                type="file"
                accept="video/mp4, video/webm, video/ogg"
                className={cn(state.errors?.video && "border-destructive focus-visible:ring-destructive")}
              />
               <p className="text-xs text-muted-foreground">Optional. Max file size: 5MB.</p>
              {state.errors?.video && <p className="text-sm text-destructive">{state.errors.video.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataAiHint">Image AI Hint</Label>
              <Input
                id="dataAiHint"
                name="dataAiHint"
                placeholder="e.g., perfume bottle"
                defaultValue={state.errors ? state.values?.dataAiHint : ''}
              />
              <p className="text-xs text-muted-foreground">Optional. One or two keywords for image search.</p>
            </div>
            <div className="space-y-4 pt-4 border-t">
                <p className="text-sm font-medium">Social Media Links (Optional)</p>
                <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                        id="instagram"
                        name="instagram"
                        placeholder="https://instagram.com/your-page"
                        className={cn(state.errors?.instagram && "border-destructive focus-visible:ring-destructive")}
                        defaultValue={state.errors ? state.values?.instagram : ''}
                    />
                    {state.errors?.instagram && <p className="text-sm text-destructive">{state.errors.instagram.join(', ')}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input
                        id="twitter"
                        name="twitter"
                        placeholder="https://x.com/your-handle"
                        className={cn(state.errors?.twitter && "border-destructive focus-visible:ring-destructive")}
                        defaultValue={state.errors ? state.values?.twitter : ''}
                    />
                    {state.errors?.twitter && <p className="text-sm text-destructive">{state.errors.twitter.join(', ')}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                        id="facebook"
                        name="facebook"
                        placeholder="https://facebook.com/your-page"
                        className={cn(state.errors?.facebook && "border-destructive focus-visible:ring-destructive")}
                        defaultValue={state.errors ? state.values?.facebook : ''}
                    />
                    {state.errors?.facebook && <p className="text-sm text-destructive">{state.errors.facebook.join(', ')}</p>}
                </div>
            </div>
            {state.message && <p className="text-sm text-destructive">{state.message}</p>}
            <div className="flex gap-4">
                <SubmitButton />
                <Button variant="outline" asChild><Link href="/dashboard/products">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
