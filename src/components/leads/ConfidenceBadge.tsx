import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONFIDENCE_CLASSES: Record<string, string> = {
  high: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  low: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  reject: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function ConfidenceBadge({ label }: { label: string | null }) {
  if (!label) return null;
  return (
    <Badge variant="outline" className={cn(CONFIDENCE_CLASSES[label])}>
      {label}
    </Badge>
  );
}
