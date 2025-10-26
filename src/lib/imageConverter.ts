import imageCompression from "browser-image-compression";

export interface ConversionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

export const convertImage = async (
  file: File,
  targetFormat: string,
  quality: number = 80
): Promise<Blob> => {
  try {
    // Handle SVG separately as it doesn't need compression
    if (targetFormat === "image/svg+xml") {
      if (file.type === "image/svg+xml") {
        return file;
      }
      throw new Error("Cannot convert non-SVG images to SVG format");
    }

    // Handle GIF separately to preserve animation
    if (targetFormat === "image/gif") {
      if (file.type === "image/gif") {
        return file;
      }
      // For now, just convert static frame
      return await compressAndConvert(file, targetFormat, quality);
    }

    // For other formats, use compression library
    return await compressAndConvert(file, targetFormat, quality);
  } catch (error) {
    console.error("Conversion error:", error);
    throw new Error(`Failed to convert image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

const compressAndConvert = async (
  file: File,
  targetFormat: string,
  quality: number
): Promise<Blob> => {
  const options: ConversionOptions = {
    maxSizeMB: 100, // Allow large files
    useWebWorker: true,
    fileType: targetFormat,
    initialQuality: quality / 100,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    // Fallback: use canvas for conversion if compression fails
    return await canvasConvert(file, targetFormat, quality);
  }
};

const canvasConvert = async (
  file: File,
  targetFormat: string,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        targetFormat,
        quality / 100
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

export const getFileExtension = (mimeType: string): string => {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/avif": "avif",
    "image/tiff": "tiff",
    "image/svg+xml": "svg",
  };
  return extensions[mimeType] || "jpg";
};
