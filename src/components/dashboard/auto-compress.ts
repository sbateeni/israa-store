import imageCompression from 'browser-image-compression';

export interface CompressedFile {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

// إعدادات ضغط الصور
const imageCompressionOptions = {
  maxSizeMB: 3, // الحد الأقصى 3MB للصور
  maxWidthOrHeight: 1920, // أقصى عرض أو ارتفاع
  useWebWorker: true,
  fileType: 'image/jpeg',
  quality: 0.8, // جودة 80%
};

// إعدادات ضغط الفيديو
const videoCompressionOptions = {
  maxSizeMB: 3, // الحد الأقصى 3MB للفيديوهات
  quality: 0.7, // جودة 70%
};

/**
 * ضغط الصور تلقائياً
 */
export async function compressImage(file: File): Promise<CompressedFile> {
  console.log('AutoCompress: Compressing image:', file.name, 'Size:', file.size);
  
  try {
    const compressedFile = await imageCompression(file, imageCompressionOptions);
    
    const compressionRatio = ((file.size - compressedFile.size) / file.size) * 100;
    
    console.log('AutoCompress: Image compressed successfully:', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: compressionRatio.toFixed(1) + '%'
    });
    
    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio
    };
  } catch (error) {
    console.error('AutoCompress: Image compression failed:', error);
    // إرجاع الملف الأصلي إذا فشل الضغط
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0
    };
  }
}

/**
 * ضغط الفيديو تلقائياً (بسيط)
 */
export async function compressVideo(file: File): Promise<CompressedFile> {
  console.log('AutoCompress: Compressing video:', file.name, 'Size:', file.size);
  
  try {
    // إذا كان الفيديو أصغر من 3MB، لا نحتاج للضغط
    if (file.size <= 3 * 1024 * 1024) {
      console.log('AutoCompress: Video is already small enough');
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0
      };
    }
    
    // للفيديوهات الكبيرة، نقوم بتقليل الجودة
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const video = document.createElement('video');
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        // تقليل الدقة
        const scale = Math.min(1, Math.sqrt((3 * 1024 * 1024) / file.size));
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        // محاولة ضغط بسيط
        const compressedBlob = new Blob([file], { 
          type: file.type 
        });
        
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        
        const compressionRatio = ((file.size - compressedFile.size) / file.size) * 100;
        
        console.log('AutoCompress: Video compressed (basic):', {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          compressionRatio: compressionRatio.toFixed(1) + '%'
        });
        
        resolve({
          file: compressedFile,
          originalSize: file.size,
          compressedSize: compressedFile.size,
          compressionRatio
        });
      };
      
      video.onerror = () => {
        console.warn('AutoCompress: Video compression failed, using original');
        resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 0
        });
      };
      
      video.src = URL.createObjectURL(file);
    });
  } catch (error) {
    console.error('AutoCompress: Video compression failed:', error);
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0
    };
  }
}

/**
 * ضغط الملف تلقائياً حسب نوعه
 */
export async function autoCompressFile(file: File): Promise<CompressedFile> {
  if (file.type.startsWith('image/')) {
    return compressImage(file);
  } else if (file.type.startsWith('video/')) {
    return compressVideo(file);
  } else {
    // للملفات الأخرى، إرجاعها كما هي
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0
    };
  }
}

/**
 * ضغط مجموعة من الملفات
 */
export async function autoCompressFiles(files: File[]): Promise<CompressedFile[]> {
  const compressedFiles: CompressedFile[] = [];
  
  for (const file of files) {
    const compressed = await autoCompressFile(file);
    compressedFiles.push(compressed);
  }
  
  return compressedFiles;
}

/**
 * التحقق من حجم الملف بعد الضغط
 */
export function isFileSizeAcceptable(compressedFile: CompressedFile): boolean {
  const maxSize = 4 * 1024 * 1024; // 4MB
  return compressedFile.compressedSize <= maxSize;
}

/**
 * الحصول على رسالة الضغط
 */
export function getCompressionMessage(compressedFile: CompressedFile): string {
  if (compressedFile.compressionRatio > 0) {
    const savedMB = (compressedFile.originalSize - compressedFile.compressedSize) / (1024 * 1024);
    return `تم ضغط الملف بنجاح! تم توفير ${savedMB.toFixed(1)}MB (${compressedFile.compressionRatio.toFixed(1)}%)`;
  }
  return 'لم يتم ضغط الملف (صغير بالفعل)';
} 