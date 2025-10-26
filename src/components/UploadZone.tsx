import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, ImagePlus } from "lucide-react";
import { toast } from "sonner";

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
}

export const UploadZone = ({ onUpload }: UploadZoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        onUpload(validFiles);
        toast.success(`${validFiles.length} image(s) uploaded successfully`);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".tiff", ".avif"],
    },
    multiple: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer
          ${
            isDragActive
              ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]"
              : "border-border hover:border-primary/50 hover:bg-card/50"
          }
        `}
      >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4 text-center">
        <motion.div
          animate={{
            scale: isDragActive ? 1.1 : 1,
            rotate: isDragActive ? 5 : 0,
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-6 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[var(--shadow-card)]"
        >
          {isDragActive ? (
            <ImagePlus className="w-12 h-12" />
          ) : (
            <Upload className="w-12 h-12" />
          )}
        </motion.div>

        <div className="space-y-2">
          <p className="text-xl font-semibold text-foreground">
            {isDragActive ? "Drop your images here" : "Drag & drop images here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse • Supports JPEG, PNG, WebP, GIF, BMP, AVIF, TIFF, SVG
          </p>
        </div>
      </div>
      </div>
    </motion.div>
  );
};
