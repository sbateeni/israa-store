"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Star, StarOff, Image as ImageIcon, Zap } from "lucide-react";
import { autoCompressFiles, isFileSizeAcceptable, getCompressionMessage } from './auto-compress';

interface MultiImageUploadProps {
  onImagesChange: (images: { url: string; isMain: boolean }[]) => void;
  maxImages?: number;
  maxSize?: number; // بالـ MB
  initialImages?: { url: string; isMain: boolean }[];
}

export default function MultiImageUpload({ 
  onImagesChange, 
  maxImages = 10, 
  maxSize = 4,
  initialImages = []
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<{ url: string; isMain: boolean; file?: File }[]>([]);
  const [uploading, setUploading] = useState(false);

  // تحميل الصور الأولية
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      const formattedImages = initialImages.map(img => ({
        url: img.url,
        isMain: img.isMain,
        file: undefined
      }));
      setImages(formattedImages);
      console.log('MultiImageUpload: Loaded initial images:', formattedImages);
    }
  }, [initialImages]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('MultiImageUpload: File select triggered');
    const files = event.target.files;
    if (!files) {
      console.log('MultiImageUpload: No files selected');
      return;
    }

    console.log('MultiImageUpload: Files selected:', files.length);
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

    setUploading(true);
    
    try {
      // ضغط الملفات تلقائياً
      console.log('MultiImageUpload: Starting auto-compression for', fileArray.length, 'files');
      const compressedFiles = await autoCompressFiles(fileArray);
      
      // التحقق من الملفات بعد الضغط
      const stillOversizedFiles = compressedFiles.filter(compressed => !isFileSizeAcceptable(compressed));
      if (stillOversizedFiles.length > 0) {
        const fileNames = stillOversizedFiles.map(c => c.file.name).join(', ');
        toast({
          title: "خطأ",
          description: `بعض الملفات لا تزال كبيرة جداً بعد الضغط: ${fileNames}`,
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
      
      // عرض رسائل الضغط
      compressedFiles.forEach(compressed => {
        if (compressed.compressionRatio > 0) {
          toast({
            title: "تم الضغط",
            description: getCompressionMessage(compressed),
          });
        }
      });
      
      const newImages = [];
      
      for (const compressed of compressedFiles) {
        const file = compressed.file;
        // رفع الملف إلى Vercel Blob
        const formData = new FormData();
        formData.append('file', file);
        
        // إنشاء مفتاح فريد للملف
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const key = `products/${timestamp}_${randomId}_${file.name}`;
        formData.append('key', key);
        
        console.log('MultiImageUpload: Uploading file:', file.name, 'with key:', key);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('MultiImageUpload: Upload failed:', errorText);
          throw new Error(`فشل رفع الملف: ${file.name} - ${errorText}`);
        }

        const data = await response.json();
        console.log('MultiImageUpload: Upload successful:', data);
        
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
      console.error('MultiImageUpload: Upload error:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل رفع الملفات",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // إعادة تعيين input
      const input = document.getElementById('multi-image-upload') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
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
    const url = prompt("أدخل رابط الصورة أو الفيديو:");
    if (!url) return;

    if (!url.startsWith('http')) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط صحيح يبدأ بـ http أو https",
        variant: "destructive",
      });
      return;
    }

    console.log('MultiImageUpload: Adding file from URL:', url);
    const newImage = {
      url,
      isMain: images.length === 0,
      file: undefined
    };

    const updatedImages = [...images, newImage];
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => ({ url: img.url, isMain: img.isMain })));
    
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة الملف من الرابط بنجاح",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">صور وفيديوهات المنتج</h3>
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
              اسحب وأفلت الصور والفيديوهات هنا أو اضغط للاختيار
            </p>
            <p className="text-xs text-gray-500 mb-4">
              الحد الأقصى: {maxImages} ملف، {maxSize}MB لكل ملف
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-blue-600 mb-4">
              <Zap className="w-4 h-4" />
              <span>ضغط تلقائي للملفات الكبيرة</span>
            </div>
            
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              disabled={uploading || images.length >= maxImages}
              className="hidden"
              id="multi-image-upload"
            />
            
            <label htmlFor="multi-image-upload" className="cursor-pointer">
              <Button
                variant="outline"
                disabled={uploading || images.length >= maxImages}
                type="button"
                onClick={() => {
                  const input = document.getElementById('multi-image-upload') as HTMLInputElement;
                  if (input) {
                    input.click();
                  }
                }}
              >
                {uploading ? "جاري الرفع..." : `اختيار الملفات (${images.length}/${maxImages})`}
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
          <p>• الصورة/الفيديو الرئيسي سيظهر في قائمة المنتجات</p>
          <p>• يمكنك تغيير الملف الرئيسي بالضغط على زر النجمة</p>
          <p>• يمكنك حذف أي ملف بالضغط على زر X</p>
          <p>• الملفات الكبيرة سيتم ضغطها تلقائياً</p>
        </div>
      )}
    </div>
  );
} 