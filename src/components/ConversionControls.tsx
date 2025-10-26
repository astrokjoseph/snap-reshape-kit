import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sparkles } from "lucide-react";

export const formats = [
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
  { value: "image/gif", label: "GIF" },
  { value: "image/bmp", label: "BMP" },
  { value: "image/avif", label: "AVIF" },
  { value: "image/tiff", label: "TIFF" },
  { value: "image/svg+xml", label: "SVG" },
] as const;

interface ConversionControlsProps {
  format: string;
  quality: number;
  onFormatChange: (format: string) => void;
  onQualityChange: (quality: number) => void;
  onConvert: () => void;
  disabled?: boolean;
  isConverting?: boolean;
}

export const ConversionControls = ({
  format,
  quality,
  onFormatChange,
  onQualityChange,
  onConvert,
  disabled,
  isConverting,
}: ConversionControlsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 shadow-[var(--shadow-card)]"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="format" className="text-base font-semibold">
            Output Format
          </Label>
          <Select value={format} onValueChange={onFormatChange}>
            <SelectTrigger id="format" className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formats.map((fmt) => (
                <SelectItem key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="quality" className="text-base font-semibold">
              Quality
            </Label>
            <span className="text-sm font-mono text-primary">{quality}%</span>
          </div>
          <Slider
            id="quality"
            value={[quality]}
            onValueChange={(values) => onQualityChange(values[0])}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher quality = larger file size
          </p>
        </div>

        <Button
          onClick={onConvert}
          disabled={disabled || isConverting}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-glow)]"
        >
          {isConverting ? (
            <>
              <div className="w-5 h-5 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Converting...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Convert Images
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
