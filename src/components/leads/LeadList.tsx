import { LeadCard } from "./LeadCard";
import type { SerializedLead } from "@/types";

export function LeadList({ leads }: { leads: SerializedLead[] }) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed p-12 text-muted-foreground">
        No leads match these filters yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
