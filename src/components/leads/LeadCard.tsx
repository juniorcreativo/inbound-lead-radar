"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { LeadStatus } from "@/generated/prisma/enums";
import type { SerializedLead } from "@/types";

export function LeadCard({ lead }: { lead: SerializedLead }) {
  const router = useRouter();
  const [isIgnoring, setIsIgnoring] = useState(false);

  async function handleIgnore(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsIgnoring(true);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: LeadStatus.IGNORED }),
      });
      router.refresh();
    } finally {
      setIsIgnoring(false);
    }
  }

  return (
    <Link href={`/dashboard/leads/${lead.id}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{lead.platform}</Badge>
            {lead.subreddit && <Badge variant="outline">r/{lead.subreddit}</Badge>}
            <StatusBadge status={lead.status} />
            <ConfidenceBadge label={lead.confidenceLabel} />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(lead.postedAt), { addSuffix: true })}
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {lead.title && <p className="font-medium">{lead.title}</p>}
          <p className="text-sm text-muted-foreground">{lead.snippet}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">u/{lead.author}</span>
            {lead.status === LeadStatus.NEW && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isIgnoring}
                onClick={handleIgnore}
              >
                Ignore
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
