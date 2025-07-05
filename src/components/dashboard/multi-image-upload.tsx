"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Star, StarOff, Image as ImageIcon } from "lucide-react";

interface MultiImageUploadProps {
  onImagesChange: (images: { url: string; isMain: boolean }[]) => void;
  maxImages?: number;
  maxSize?: number; // بالـ MB
}

export default function MultiImageUpload({ 
  onImagesChange, 
  maxImages = 10, 
  maxSize = 100 
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<{ url: string; isMain: boolean; file?: File }[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // التحقق من عدد الصور
    if (images.length + fileArray.length > maxImages) {
      toast({
        title: "خطأ",
        description: `يمكنك رفع ${maxImages} صور كحد أقصى`,
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملفات
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "خطأ",
        description: `بعض الملفات أكبر من ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const newImages = [];
      
      for (const file of fileArray) {
        // رفع الملف إلى Vercel Blob
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`فشل رفع الملف: ${file.name}`);
        }

        const data = await response.json();
        
        newImages.push({
          url: data.url,
          isMain: images.length === 0 && newImages.length === 0, // أول صورة كرئيسية
          file
        });
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages.map(img => ({ url: img.url, isMain: img.isMain })));

      toast({
        title: "تم الرفع بنجاح",
        description: `تم رفع ${fileArray.length} ملف بنجاح`,
      });

    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل رفع الملفات",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, maxSize, onImagesChange, toast]);

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    
    // إذا كانت الصورة المحذوفة هي الرئيسية، اجعل أول صورة رئيسية
    if (images[index].isMain && updatedImages.length > 0) {
      updatedImages[0].isMain = true;
    }
    
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => ({ url: img.url, isMain: img.isMain })));
  };

  const setMainImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => ({ url: img.url, isMain: img.isMain })));
  };

  const addImageFromUrl = () => {
    const url = prompt("أدخل رابط الصورة:");
    if (!url) return;

    if (!url.startsWith('http')) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط صحيح يبدأ بـ http أو https",
        variant: "destructive",
      });
      return;
    }

    const newImage = {
      url,
      isMain: images.length === 0,
      file: undefined
    };

    const updatedImages = [...images, newImage];
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => ({ url: img.url, isMain: img.isMain })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">صور المنتج</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addImageFromUrl}
            disabled={images.length >= maxImages}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            إضافة من رابط
          </Button>
        </div>
      </div>

      {/* منطقة رفع الملفات */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              اسحب وأفلت الصور هنا أو اضغط للاختيار
            </p>
            <p className="text-xs text-gray-500 mb-4">
              الحد الأقصى: {maxImages} صور، {maxSize}MB لكل صورة
            </p>
            
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading || images.length >= maxImages}
              className="hidden"
              id="multi-image-upload"
            />
            
            <label htmlFor="multi-image-upload">
              <Button
                variant="outline"
                disabled={uploading || images.length >= maxImages}
                className="cursor-pointer"
              >
                {uploading ? "جاري الرفع..." : `اختيار الصور (${images.length}/${maxImages})`}
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* عرض الصور المرفوعة */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                  
                  {/* الصورة الرئيسية */}
                  {image.isMain && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      رئيسية
                    </Badge>
                  )}
                  
                  {/* أزرار التحكم */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.isMain && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setMainImage(index)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500 truncate">
                    {image.file ? image.file.name : 'رابط خارجي'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* معلومات إضافية */}
      {images.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>• الصورة الرئيسية ستظهر في قائمة المنتجات</p>
          <p>• يمكنك تغيير الصورة الرئيسية بالضغط على زر النجمة</p>
          <p>• يمكنك حذف أي صورة بالضغط على زر X</p>
        </div>
      )}
    </div>
  );
} 