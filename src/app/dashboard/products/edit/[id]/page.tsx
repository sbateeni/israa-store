
'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent, useTransition } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductCategory } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { updateProduct } from '../actions';
import { useFormState } from 'react-dom';

const EditFormSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
    </div>
);


export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLocal, setIsLocal] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const isLocalProduct = id.startsWith('local-');
        setIsLocal(isLocalProduct);

        async function fetchProduct() {
            setLoading(true);
            try {
                let productData: Product | null = null;
                if (isLocalProduct) {
                    const localProductsJSON = localStorage.getItem('isra-store-products');
                    const localProducts: Product[] = localProductsJSON ? JSON.parse(localProductsJSON) : [];
                    productData = localProducts.find(p => p.id === id) || null;
                } else {
                    const productRef = doc(db, 'products', id);
                    const docSnap = await getDoc(productRef);
                    if (docSnap.exists()) {
                        productData = { id: docSnap.id, ...docSnap.data() } as Product;
                    }
                }

                if (productData) {
                    setProduct(productData);
                    setImagePreview(productData.image);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Product not found.' });
                    router.push('/dashboard/products');
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch product data.' });
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id, router, toast]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(product?.image || null);
        }
    };
    
    // Server action state
    const [state, formAction] = useFormState(updateProduct, { message: null, errors: {}, values: {} });
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (state.message) {
            if (!state.errors || Object.keys(state.errors).length === 0) {
                toast({ title: 'Success', description: state.message });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast]);

    const handleLocalSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(() => {
            const formData = new FormData(event.currentTarget);
            const updatedData: Partial<Product> = {
                name: formData.get('name') as string || 'Untitled Product',
                description: formData.get('description') as string || 'No description.',
                price: Number(formData.get('price')) || 0,
                category: (formData.get('category') as ProductCategory) || 'Perfumes',
                image: imagePreview || 'https://placehold.co/600x600.png',
                dataAiHint: formData.get('dataAiHint') as string | undefined,
            };

            try {
                const localProductsJSON = localStorage.getItem('isra-store-products');
                let localProducts: Product[] = localProductsJSON ? JSON.parse(localProductsJSON) : [];
                const productIndex = localProducts.findIndex(p => p.id === id);
                if (productIndex > -1) {
                    localProducts[productIndex] = { ...localProducts[productIndex], ...updatedData };
                    localStorage.setItem('isra-store-products', JSON.stringify(localProducts));
                    toast({ title: 'Success', description: 'Product updated locally.' });
                    router.push('/dashboard/products');
                } else {
                    throw new Error("Local product not found for update.");
                }
            } catch (error) {
                console.error("Failed to update local product", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not update the product.' });
            }
        });
    };

    const handleSubmit = isLocal ? handleLocalSubmit : (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startTransition(() => {
            formAction(new FormData(e.currentTarget));
        });
    };

    if (loading) {
        return (
            <div className="container py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Product</CardTitle>
                        <CardDescription>Make changes to your product below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EditFormSkeleton />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!product) return null;

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
                    <CardTitle>Edit Product</CardTitle>
                    <CardDescription>
                        {isLocal
                            ? "This product is stored locally in your browser."
                            : "Make changes to your product stored in Firebase."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="currentImageUrl" value={product.image} />
                         {product.video && <input type="hidden" name="currentVideoUrl" value={product.video} />}


                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input id="name" name="name" defaultValue={product.name} />
                            {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={product.description} />
                            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₪)</Label>
                                <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price} />
                                {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select name="category" defaultValue={product.category}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Perfumes">Perfumes</SelectItem>
                                        <SelectItem value="Apparel">Apparel</SelectItem>
                                        <SelectItem value="Creams">Creams</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Product Image</Label>
                            <Input id="image" name="image" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                             {state.errors?.image && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
                        </div>

                        {imagePreview && (
                            <div className="space-y-2">
                                <Label>Image Preview</Label>
                                <Image src={imagePreview} alt="Product preview" width={100} height={100} className="rounded-md object-cover border" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="dataAiHint">Image AI Hint</Label>
                            <Input id="dataAiHint" name="dataAiHint" defaultValue={product.dataAiHint} />
                        </div>
                        
                        <div className="flex gap-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button variant="outline" asChild><Link href="/dashboard/products">Cancel</Link></Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
