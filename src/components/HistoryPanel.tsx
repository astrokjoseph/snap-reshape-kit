import { motion, AnimatePresence } from "framer-motion";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface HistoryItem {
  id: string;
  filename: string;
  format: string;
  date: string;
  size: string;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onClear: () => void;
}

export const HistoryPanel = ({ history, onClear }: HistoryPanelProps) => {
  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-xl p-6 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Conversions</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="hover:text-destructive"
        >
          Clear All
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <AnimatePresence>
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="mb-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
            >
              <p className="text-sm font-medium text-foreground truncate mb-1">
                {item.filename}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-primary">{item.format}</span>
                <span>{item.size}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
    </motion.div>
  );
};
