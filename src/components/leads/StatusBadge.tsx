import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LeadStatus } from "@/generated/prisma/enums";

const STATUS_LABELS: Record<string, string> = {
  [LeadStatus.NEW]: "New",
  [LeadStatus.DRAFT_READY]: "Draft Ready",
  [LeadStatus.REPLIED]: "Replied",
  [LeadStatus.IGNORED]: "Ignored",
  [LeadStatus.CONVERTED]: "Converted",
};

const STATUS_CLASSES: Record<string, string> = {
  [LeadStatus.NEW]: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  [LeadStatus.DRAFT_READY]: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  [LeadStatus.REPLIED]: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  [LeadStatus.IGNORED]: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  [LeadStatus.CONVERTED]: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASSES[status])}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
