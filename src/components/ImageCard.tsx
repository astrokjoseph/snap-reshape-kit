import { motion } from "framer-motion";
import { X, GripVertical, Download, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface ImageData {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  status: "pending" | "converting" | "completed" | "error";
}

interface ImageCardProps {
  image: ImageData;
  onRemove: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onDownload?: (id: string) => void;
  dragHandleProps?: any;
}

export const ImageCard = ({
  image,
  onRemove,
  onRename,
  onDownload,
  dragHandleProps,
}: ImageCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(image.name);

  const handleRename = () => {
    if (editedName.trim() && editedName !== image.name) {
      onRename(image.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all"
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="absolute top-2 left-2 z-10 p-1 rounded bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(image.id)}
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Image Preview */}
      <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
        {image.preview ? (
          <img
            src={image.convertedUrl || image.preview}
            alt={image.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileImage className="w-12 h-12 text-muted-foreground" />
        )}

        {/* Status Overlay */}
        {image.status === "converting" && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-foreground">Converting...</p>
            </div>
          </div>
        )}

        {image.status === "completed" && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
            Converted
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-3">
        {isEditing ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="text-sm"
            autoFocus
          />
        ) : (
          <p
            className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() => setIsEditing(true)}
            title={image.name}
          >
            {image.name}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatSize(image.size)}</span>
          {image.convertedSize && (
            <span className="text-accent">→ {formatSize(image.convertedSize)}</span>
          )}
        </div>

        {image.status === "completed" && onDownload && (
          <Button
            onClick={() => onDownload(image.id)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </div>
    </motion.div>
  );
};
