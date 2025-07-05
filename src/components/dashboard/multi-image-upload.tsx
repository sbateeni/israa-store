"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  X, 
  Star, 
  StarOff, 
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface ImageFile {
  id: string;
  file: File;
  url?: string;
  isMain: boolean;
  isUploading: boolean;
  uploadError?: string;
}

interface MultiImageUploadProps {
  onImagesChange: (images: { url: string; isMain: boolean }[]) => void;
  maxImages?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
}

export default function MultiImageUpload({
  onImagesChange,
  maxImages = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize = 10
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحويل الصور إلى التنسيق المطلوب
  const updateParentImages = (newImages: ImageFile[]) => {
    const uploadedImages = newImages
      .filter(img => img.url && !img.isUploading && !img.uploadError)
      .map(img => ({
        url: img.url!,
        isMain: img.isMain
      }));
    onImagesChange(uploadedImages);
  };

  // رفع صورة واحدة
  const uploadImage = async (imageFile: ImageFile): Promise<string> => {
    const formData = new FormData();
    formData.append('file', imageFile.file);
    
    // إنشاء مفتاح فريد للصورة
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const key = `products/${timestamp}_${randomId}_${imageFile.file.name}`;
    formData.append('key', key);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل رفع الصورة');
    }

    const result = await response.json();
    return result.url;
  };

  // إضافة صور جديدة
  const addImages = async (files: FileList) => {
    const newImages: ImageFile[] = [];
    
    // تحويل FileList إلى Array
    const fileArray = Array.from(files);
    
    // التحقق من عدد الصور
    if (images.length + fileArray.length > maxImages) {
      toast({
        title: "خطأ",
        description: `يمكن رفع ${maxImages} صور كحد أقصى`,
        variant: "destructive"
      });
      return;
    }

    // إنشاء كائنات الصور
    for (const file of fileArray) {
      // التحقق من نوع الملف
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "خطأ",
          description: `نوع الملف ${file.name} غير مدعوم`,
          variant: "destructive"
        });
        continue;
      }

      // التحقق من حجم الملف
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "خطأ",
          description: `حجم الملف ${file.name} أكبر من ${maxSize}MB`,
          variant: "destructive"
        });
        continue;
      }

      const imageFile: ImageFile = {
        id: Math.random().toString(36).substring(2, 15),
        file,
        isMain: images.length === 0 && newImages.length === 0, // أول صورة تكون رئيسية
        isUploading: true
      };

      newImages.push(imageFile);
    }

    // إضافة الصور الجديدة للقائمة
    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);

    // رفع الصور
    for (const imageFile of newImages) {
      try {
        const url = await uploadImage(imageFile);
        
        setImages(prev => prev.map(img => 
          img.id === imageFile.id 
            ? { ...img, url, isUploading: false }
            : img
        ));
      } catch (error) {
        console.error('Upload error:', error);
        setImages(prev => prev.map(img => 
          img.id === imageFile.id 
            ? { ...img, isUploading: false, uploadError: error instanceof Error ? error.message : 'فشل الرفع' }
            : img
        ));
      }
    }

    // تحديث الصور في المكون الأب
    setTimeout(() => {
      const currentImages = [...images, ...newImages];
      updateParentImages(currentImages);
    }, 100);
  };

  // حذف صورة
  const removeImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    const wasMain = imageToRemove?.isMain;
    
    const updatedImages = images.filter(img => img.id !== imageId);
    
    // إذا كانت الصورة المحذوفة هي الرئيسية، اجعل أول صورة رئيسية
    if (wasMain && updatedImages.length > 0) {
      updatedImages[0].isMain = true;
    }
    
    setImages(updatedImages);
    updateParentImages(updatedImages);
    
    toast({
      title: "تم الحذف",
      description: "تم حذف الصورة بنجاح"
    });
  };

  // تعيين صورة كرئيسية
  const setMainImage = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isMain: img.id === imageId
    }));
    
    setImages(updatedImages);
    updateParentImages(updatedImages);
    
    toast({
      title: "تم التحديث",
      description: "تم تعيين الصورة الرئيسية بنجاح"
    });
  };

  // معالجة السحب والإفلات
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addImages(files);
    }
  };

  // معالجة النقر على زر الرفع
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addImages(files);
    }
    // إعادة تعيين input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          رفع صور المنتج
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* منطقة رفع الصور */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            اسحب الصور هنا أو اضغط للاختيار
          </p>
          <p className="text-sm text-gray-500 mb-4">
            يمكنك رفع {maxImages} صور كحد أقصى، حجم كل صورة حتى {maxSize}MB
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= maxImages}
          >
            <Upload className="h-4 w-4 mr-2" />
            اختيار الصور
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* عرض الصور المرفوعة */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">الصور المرفوعة ({images.length}/{maxImages})</h3>
              <Badge variant="outline">
                {images.filter(img => img.isMain).length} صورة رئيسية
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative group border rounded-lg overflow-hidden ${
                    image.isMain ? 'ring-2 ring-primary' : 'border-gray-200'
                  }`}
                >
                  {/* صورة معاينة */}
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {image.isUploading ? (
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                        <p className="text-xs text-gray-500">جاري الرفع...</p>
                      </div>
                    ) : image.uploadError ? (
                      <div className="text-center p-2">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                        <p className="text-xs text-red-500">فشل الرفع</p>
                      </div>
                    ) : image.url ? (
                      <img
                        src={image.url}
                        alt={image.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* شارة الصورة الرئيسية */}
                  {image.isMain && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary text-white">
                        <Star className="h-3 w-3 mr-1" />
                        رئيسية
                      </Badge>
                    </div>
                  )}

                  {/* أزرار التحكم */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.isMain && !image.isUploading && !image.uploadError && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setMainImage(image.id)}
                        className="bg-white text-gray-800 hover:bg-gray-100"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        رئيسية
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(image.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* اسم الملف */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                    <p className="text-xs truncate">{image.file.name}</p>
                    <p className="text-xs text-gray-300">
                      {(image.file.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* رسائل الحالة */}
            {images.some(img => img.uploadError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  بعض الصور فشل رفعها. يمكنك حذفها والمحاولة مرة أخرى.
                </AlertDescription>
              </Alert>
            )}

            {images.every(img => img.url && !img.isUploading) && images.length > 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  تم رفع جميع الصور بنجاح! الصورة المميزة باللون الأزرق هي الصورة الرئيسية.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 