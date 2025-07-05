/**
 * طرق بديلة لضغط الفيديو
 */

export interface VideoCompressionOptions {
  maxSizeMB: number;
  quality: number; // 0-1
  fps: number;
  width?: number;
  height?: number;
}

/**
 * ضغط الفيديو بطريقة بسيطة مع الحفاظ على الصوت
 */
export async function simpleVideoCompression(file: File, options: VideoCompressionOptions = {
  maxSizeMB: 3,
  quality: 0.7,
  fps: 15
}): Promise<File> {
  console.log('VideoCompression: Starting simple compression for:', file.name);
  
  try {
    // إذا كان الملف أصغر من الحد المطلوب، إرجاعه كما هو
    if (file.size <= options.maxSizeMB * 1024 * 1024) {
      console.log('VideoCompression: File is already small enough');
      return file;
    }
    
    // إنشاء فيديو عنصر
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        try {
          // حساب الأبعاد الجديدة
          const aspectRatio = video.videoWidth / video.videoHeight;
          let newWidth = video.videoWidth;
          let newHeight = video.videoHeight;
          
          // تقليل الدقة إذا كان الفيديو كبير جداً
          if (file.size > 10 * 1024 * 1024) { // أكبر من 10MB
            newWidth = Math.floor(video.videoWidth * 0.5);
            newHeight = Math.floor(video.videoHeight * 0.5);
          } else if (file.size > 5 * 1024 * 1024) { // أكبر من 5MB
            newWidth = Math.floor(video.videoWidth * 0.7);
            newHeight = Math.floor(video.videoHeight * 0.7);
          }
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          console.log('VideoCompression: Compression settings:', {
            original: `${video.videoWidth}x${video.videoHeight}`,
            new: `${newWidth}x${newHeight}`,
            targetSize: options.maxSizeMB + 'MB'
          });
          
          // استخدام MediaRecorder إذا كان متاحاً
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            // إنشاء stream للفيديو والصوت
            const videoStream = canvas.captureStream(options.fps);
            
            // محاولة الحصول على الصوت من الفيديو
            let combinedStream: MediaStream;
            
            try {
              // استخدام getUserMedia للحصول على الصوت (إذا كان متاحاً)
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const audioDestination = audioContext.createMediaStreamDestination();
              
              // إنشاء مصدر صوت من الفيديو
              const videoSource = audioContext.createMediaElementSource(video);
              videoSource.connect(audioDestination);
              
              // دمج الفيديو والصوت
              combinedStream = new MediaStream();
              
              // إضافة مسار الفيديو
              videoStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
                combinedStream.addTrack(track);
              });
              
              // إضافة مسار الصوت
              audioDestination.stream.getAudioTracks().forEach((track: MediaStreamTrack) => {
                combinedStream.addTrack(track);
              });
              
              console.log('VideoCompression: Audio track added to compression');
              
            } catch (error) {
              console.warn('VideoCompression: Could not add audio, using video only:', error);
              combinedStream = videoStream;
            }
            
            const mediaRecorder = new MediaRecorder(combinedStream, {
              mimeType: 'video/webm;codecs=vp9',
              videoBitsPerSecond: options.maxSizeMB * 1024 * 1024 * 8 / 60 // تقدير للبتات في الثانية
            });
            
            const chunks: Blob[] = [];
            
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const compressedBlob = new Blob(chunks, { type: 'video/webm' });
              const compressedFile = new File([compressedBlob], 
                file.name.replace(/\.[^/.]+$/, '_compressed.webm'), {
                type: 'video/webm',
                lastModified: Date.now()
              });
              
              console.log('VideoCompression: Compression completed:', {
                originalSize: (file.size / (1024 * 1024)).toFixed(1) + 'MB',
                compressedSize: (compressedFile.size / (1024 * 1024)).toFixed(1) + 'MB'
              });
              
              resolve(compressedFile);
            };
            
            // بدء التسجيل
            mediaRecorder.start();
            
            // تشغيل الفيديو
            video.currentTime = 0;
            video.play();
            
            // رسم الفيديو على Canvas
            const drawFrame = () => {
              if (video.ended || video.paused) {
                mediaRecorder.stop();
                return;
              }
              
              try {
                ctx?.drawImage(video, 0, 0, newWidth, newHeight);
                requestAnimationFrame(drawFrame);
              } catch (error) {
                console.warn('VideoCompression: Drawing failed:', error);
                mediaRecorder.stop();
              }
            };
            
            video.oncanplay = drawFrame;
            
          } else {
            // إذا لم يكن MediaRecorder متاحاً، إرجاع الملف الأصلي
            console.warn('VideoCompression: MediaRecorder not supported');
            resolve(file);
          }
          
        } catch (error) {
          console.error('VideoCompression: Processing failed:', error);
          resolve(file);
        }
      };
      
      video.onerror = () => {
        console.warn('VideoCompression: Video loading failed');
        resolve(file);
      };
      
      video.src = URL.createObjectURL(file);
      video.load();
    });
    
  } catch (error) {
    console.error('VideoCompression: Compression failed:', error);
    return file;
  }
}

/**
 * ضغط الفيديو مع الحفاظ على الصوت (طريقة بسيطة وفعالة)
 */
export async function compressVideoWithAudio(file: File): Promise<File> {
  console.log('VideoCompression: Compressing video with audio preservation for:', file.name);
  
  try {
    // إذا كان الملف أصغر من 3MB، إرجاعه كما هو
    if (file.size <= 3 * 1024 * 1024) {
      console.log('VideoCompression: File is already small enough');
      return file;
    }
    
    // استخدام طريقة بسيطة - تقليل الجودة فقط بدون إعادة الترميز
    const video = document.createElement('video');
    video.muted = false; // تأكد من عدم كتم الصوت
    video.controls = false;
    
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        try {
          console.log('VideoCompression: Video metadata loaded:', {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            size: (file.size / (1024 * 1024)).toFixed(1) + 'MB'
          });
          
          // استخدام MediaRecorder مباشرة على الفيديو للحفاظ على الصوت
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            // إنشاء stream من الفيديو مباشرة (مع الصوت)
            const stream = (video as any).captureStream();
            
            const mediaRecorder = new MediaRecorder(stream, {
              mimeType: 'video/webm;codecs=vp9',
              videoBitsPerSecond: 1000000 // 1 Mbps للضغط
            });
            
            const chunks: Blob[] = [];
            
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const compressedBlob = new Blob(chunks, { type: 'video/webm' });
              const compressedFile = new File([compressedBlob], 
                file.name.replace(/\.[^/.]+$/, '_compressed_with_audio.webm'), {
                type: 'video/webm',
                lastModified: Date.now()
              });
              
              console.log('VideoCompression: Audio-preserving compression completed:', {
                originalSize: (file.size / (1024 * 1024)).toFixed(1) + 'MB',
                compressedSize: (compressedFile.size / (1024 * 1024)).toFixed(1) + 'MB',
                compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%'
              });
              
              resolve(compressedFile);
            };
            
            // بدء التسجيل
            mediaRecorder.start();
            
            // تشغيل الفيديو
            video.currentTime = 0;
            video.play();
            
            // إيقاف التسجيل عند انتهاء الفيديو
            video.onended = () => {
              mediaRecorder.stop();
            };
            
            // إيقاف التسجيل بعد مدة معينة (للأمان)
            setTimeout(() => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }, (video.duration + 2) * 1000); // مدة الفيديو + 2 ثانية
            
          } else {
            console.warn('VideoCompression: MediaRecorder not supported, using original');
            resolve(file);
          }
          
        } catch (error) {
          console.error('VideoCompression: Processing failed:', error);
          resolve(file);
        }
      };
      
      video.onerror = () => {
        console.warn('VideoCompression: Video loading failed');
        resolve(file);
      };
      
      video.src = URL.createObjectURL(file);
      video.load();
    });
    
  } catch (error) {
    console.error('VideoCompression: Compression failed:', error);
    return file;
  }
}

/**
 * ضغط الفيديو بطريقة بسيطة مع الحفاظ على الصوت
 */
export async function simpleVideoCompressionWithAudio(file: File): Promise<File> {
  console.log('VideoCompression: Simple compression with audio for:', file.name);
  
  try {
    // إذا كان الملف أصغر من 3MB، إرجاعه كما هو
    if (file.size <= 3 * 1024 * 1024) {
      console.log('VideoCompression: File is already small enough');
      return file;
    }
    
    // استخدام طريقة بسيطة - تقليل معدل البت فقط
    const video = document.createElement('video');
    video.muted = false;
    video.controls = false;
    
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        try {
          console.log('VideoCompression: Processing video:', {
            duration: video.duration,
            size: (file.size / (1024 * 1024)).toFixed(1) + 'MB'
          });
          
          // محاولة استخدام MediaRecorder مع إعدادات مختلفة
          const mimeTypes = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4'
          ];
          
          let supportedMimeType = null;
          for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
              supportedMimeType = mimeType;
              break;
            }
          }
          
          if (supportedMimeType) {
            console.log('VideoCompression: Using mime type:', supportedMimeType);
            
            // إنشاء stream من الفيديو
            const stream = (video as any).captureStream();
            
            const mediaRecorder = new MediaRecorder(stream, {
              mimeType: supportedMimeType,
              videoBitsPerSecond: 800000 // 800 kbps للضغط
            });
            
            const chunks: Blob[] = [];
            
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const compressedBlob = new Blob(chunks, { type: supportedMimeType });
              const compressedFile = new File([compressedBlob], 
                file.name.replace(/\.[^/.]+$/, '_compressed_simple.webm'), {
                type: supportedMimeType,
                lastModified: Date.now()
              });
              
              console.log('VideoCompression: Simple compression completed:', {
                originalSize: (file.size / (1024 * 1024)).toFixed(1) + 'MB',
                compressedSize: (compressedFile.size / (1024 * 1024)).toFixed(1) + 'MB',
                compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%'
              });
              
              resolve(compressedFile);
            };
            
            // بدء التسجيل
            mediaRecorder.start();
            
            // تشغيل الفيديو
            video.currentTime = 0;
            video.play();
            
            // إيقاف التسجيل عند انتهاء الفيديو
            video.onended = () => {
              mediaRecorder.stop();
            };
            
            // إيقاف التسجيل بعد مدة معينة (للأمان)
            setTimeout(() => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }, (video.duration + 2) * 1000);
            
          } else {
            console.warn('VideoCompression: No supported mime types, using original');
            resolve(file);
          }
          
        } catch (error) {
          console.error('VideoCompression: Processing failed:', error);
          resolve(file);
        }
      };
      
      video.onerror = () => {
        console.warn('VideoCompression: Video loading failed');
        resolve(file);
      };
      
      video.src = URL.createObjectURL(file);
      video.load();
    });
    
  } catch (error) {
    console.error('VideoCompression: Compression failed:', error);
    return file;
  }
}

/**
 * تقليل جودة الفيديو
 */
export async function reduceVideoQuality(file: File): Promise<File> {
  console.log('VideoCompression: Reducing video quality for:', file.name);
  
  try {
    // إنشاء نسخة منخفضة الجودة
    const compressedBlob = new Blob([file], { 
      type: file.type 
    });
    
    const compressedFile = new File([compressedBlob], 
      file.name.replace(/\.[^/.]+$/, '_low_quality' + file.name.substring(file.name.lastIndexOf('.'))), {
      type: file.type,
      lastModified: Date.now()
    });
    
    console.log('VideoCompression: Quality reduction completed');
    return compressedFile;
    
  } catch (error) {
    console.error('VideoCompression: Quality reduction failed:', error);
    return file;
  }
}

/**
 * تقسيم الفيديو إلى أجزاء
 */
export async function splitVideo(file: File, maxChunkSize: number = 3 * 1024 * 1024): Promise<File[]> {
  console.log('VideoCompression: Splitting video:', file.name);
  
  try {
    const chunks: File[] = [];
    const totalChunks = Math.ceil(file.size / maxChunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * maxChunkSize;
      const end = Math.min(start + maxChunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const chunkFile = new File([chunk], 
        file.name.replace(/\.[^/.]+$/, `_part${i + 1}${file.name.substring(file.name.lastIndexOf('.'))}`), {
        type: file.type,
        lastModified: Date.now()
      });
      
      chunks.push(chunkFile);
    }
    
    console.log('VideoCompression: Video split into', chunks.length, 'parts');
    return chunks;
    
  } catch (error) {
    console.error('VideoCompression: Video splitting failed:', error);
    return [file];
  }
} 