import { motion } from "framer-motion";
import { ImageIcon, Zap, Download } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(262_83%_58%/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsl(189_94%_43%/0.15),transparent_50%)]" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)] mb-4"
          >
            <ImageIcon className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_3s_ease_infinite]">
            ImageFormatX
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Universal image converter supporting 8+ formats. Upload, convert, and download — all in your browser with zero backend.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-6 justify-center pt-6"
          >
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              text="Lightning Fast"
            />
            <FeatureCard
              icon={<Download className="w-5 h-5" />}
              text="Batch Download"
            />
            <FeatureCard
              icon={<ImageIcon className="w-5 h-5" />}
              text="8+ Formats"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-[var(--shadow-card)]">
    <div className="text-primary">{icon}</div>
    <span className="text-sm font-medium text-foreground">{text}</span>
  </div>
);
