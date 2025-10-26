import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hero } from "@/components/Hero";
import { UploadZone } from "@/components/UploadZone";
import { ImageCard, ImageData } from "@/components/ImageCard";
import { ConversionControls, formats } from "@/components/ConversionControls";
import { HistoryPanel, HistoryItem } from "@/components/HistoryPanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { convertImage, getFileExtension } from "@/lib/imageConverter";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Download, Moon, Sun } from "lucide-react";

const Index = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [format, setFormat] = useState<string>("image/webp");
  const [quality, setQuality] = useState<number>(80);
  const [isConverting, setIsConverting] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("imageformatx-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }

    // Load theme preference
    const savedTheme = localStorage.getItem("imageformatx-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  // Save history to localStorage
  const addToHistory = (filename: string, format: string, size: number) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      filename,
      format,
      date: new Date().toLocaleString(),
      size: formatSize(size),
    };

    const newHistory = [newItem, ...history].slice(0, 20); // Keep last 20 items
    setHistory(newHistory);
    localStorage.setItem("imageformatx-history", JSON.stringify(newHistory));
  };

  const handleUpload = (files: File[]) => {
    const newImages: ImageData[] = files.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      status: "pending" as const,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        if (image.convertedUrl) URL.revokeObjectURL(image.convertedUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleRename = (id: string, newName: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, name: newName } : img))
    );
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      toast.error("Please upload images first");
      return;
    }

    setIsConverting(true);
    const formatLabel = formats.find((f) => f.value === format)?.label || "Unknown";

    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      // Update status to converting
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, status: "converting" as const } : img
        )
      );

      toast.info(`Converting ${i + 1} of ${images.length}: ${image.name}`);

      try {
        const convertedBlob = await convertImage(image.file, format, quality);
        const convertedUrl = URL.createObjectURL(convertedBlob);

        // Generate new filename with correct extension
        const baseName = image.name.replace(/\.[^/.]+$/, "");
        const extension = getFileExtension(format);
        const newName = `${baseName}.${extension}`;

        // Update image with converted data
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  convertedBlob,
                  convertedUrl,
                  convertedSize: convertedBlob.size,
                  name: newName,
                  status: "completed" as const,
                }
              : img
          )
        );

        // Add to history
        addToHistory(newName, formatLabel, convertedBlob.size);
      } catch (error) {
        console.error("Conversion failed:", error);
        toast.error(`Failed to convert ${image.name}`);
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, status: "error" as const } : img
          )
        );
      }
    }

    setIsConverting(false);
    toast.success("All images converted successfully!");
  };

  const handleDownload = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image || !image.convertedBlob) return;

    saveAs(image.convertedBlob, image.name);
    toast.success(`Downloaded ${image.name}`);
  };

  const handleDownloadAll = async () => {
    const completedImages = images.filter((img) => img.convertedBlob);

    if (completedImages.length === 0) {
      toast.error("No converted images to download");
      return;
    }

    if (completedImages.length === 1) {
      handleDownload(completedImages[0].id);
      return;
    }

    toast.info("Creating ZIP archive...");

    try {
      const zip = new JSZip();

      completedImages.forEach((image) => {
        if (image.convertedBlob) {
          zip.file(image.name, image.convertedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `imageformatx-converted-${Date.now()}.zip`);
      toast.success("Downloaded all images as ZIP");
    } catch (error) {
      console.error("Failed to create ZIP:", error);
      toast.error("Failed to create ZIP archive");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("imageformatx-history");
    toast.success("History cleared");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("imageformatx-theme", newTheme);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const completedCount = images.filter((img) => img.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full shadow-[var(--shadow-card)]"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </Button>
      </div>

      <Hero />

      <div className="container mx-auto max-w-7xl px-4 pb-20">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* Upload Zone */}
            {images.length === 0 && <UploadZone onUpload={handleUpload} />}

            {/* Image Grid */}
            {images.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Images ({images.length})
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setImages([])}
                    className="hover:border-destructive hover:text-destructive"
                  >
                    Clear All
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  <AnimatePresence>
                    {images.map((image) => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        onRemove={handleRemove}
                        onRename={handleRename}
                        onDownload={handleDownload}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                <div className="flex justify-center">
                  <UploadZone onUpload={handleUpload} />
                </div>

                {/* Download All Button */}
                {completedCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <Button
                      onClick={handleDownloadAll}
                      size="lg"
                      className="bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity shadow-[var(--shadow-glow)] h-14 px-8 text-lg font-semibold"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download All as ZIP ({completedCount})
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {images.length > 0 && (
              <ConversionControls
                format={format}
                quality={quality}
                onFormatChange={setFormat}
                onQualityChange={setQuality}
                onConvert={handleConvert}
                disabled={images.length === 0}
                isConverting={isConverting}
              />
            )}

            <HistoryPanel history={history} onClear={clearHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
