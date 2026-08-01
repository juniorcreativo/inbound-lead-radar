"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./StatusBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { DraftEditor } from "./DraftEditor";
import { LeadStatus } from "@/generated/prisma/enums";
import { daysSince, isStale } from "@/lib/format";
import type { ContactInfo, SerializedLead } from "@/types";

export function LeadDetail({ lead }: { lead: SerializedLead }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const contactInfo = lead.contactInfo as ContactInfo | null;

  async function updateStatus(newStatus: LeadStatus) {
    setIsUpdating(true);
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      router.refresh();
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{lead.platform}</Badge>
              {lead.subreddit && <Badge variant="outline">r/{lead.subreddit}</Badge>}
              <StatusBadge status={status} />
              <ConfidenceBadge label={lead.confidenceLabel} />
            </div>
            {lead.title && <CardTitle className="mt-2">{lead.title}</CardTitle>}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="whitespace-pre-wrap text-sm">{lead.fullText}</p>
            <a
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline underline-offset-4"
            >
              View original on Reddit ↗
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Draft Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <DraftEditor
              leadId={lead.id}
              initialDraft={lead.draftReply ?? ""}
              hasExistingDraft={Boolean(lead.draftReply)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Author</span>
              <span>u/{lead.author}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Posted</span>
              <span className={isStale(lead.postedAt) ? "font-medium text-amber-500" : undefined}>
                {isStale(lead.postedAt) && "⚠ "}
                {format(new Date(lead.postedAt), "MMM d, yyyy p")}
                {isStale(lead.postedAt) && ` (${Math.floor(daysSince(lead.postedAt))}d old)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Found</span>
              <span>{format(new Date(lead.foundAt), "MMM d, yyyy p")}</span>
            </div>
            {lead.nicheTag && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Niche</span>
                <span>{lead.nicheTag}</span>
              </div>
            )}
            {lead.matchedPhrase && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Matched phrase</span>
                <span className="text-right">&quot;{lead.matchedPhrase}&quot;</span>
              </div>
            )}
            {lead.needSummary && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">What they need</span>
                  <p className="mt-1">{lead.needSummary}</p>
                </div>
              </>
            )}
            {contactInfo && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground">Contact info</span>
                  <div className="flex flex-wrap gap-1.5">
                    {contactInfo.dmsOpen && <Badge variant="outline">DMs open</Badge>}
                    {contactInfo.emails.map((email) => (
                      <Badge key={email} variant="outline">
                        {email}
                      </Badge>
                    ))}
                    {contactInfo.discord.map((handle) => (
                      <Badge key={handle} variant="outline">
                        {handle}
                      </Badge>
                    ))}
                    {!contactInfo.dmsOpen &&
                      contactInfo.emails.length === 0 &&
                      contactInfo.discord.length === 0 && (
                        <span className="text-xs text-muted-foreground">None given</span>
                      )}
                  </div>
                  {contactInfo.otherNotes && (
                    <p className="text-xs text-muted-foreground">{contactInfo.otherNotes}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {(status === LeadStatus.NEW || status === LeadStatus.DRAFT_READY) && (
              <Button disabled={isUpdating} onClick={() => updateStatus(LeadStatus.REPLIED)}>
                Mark Replied
              </Button>
            )}
            {status === LeadStatus.REPLIED && (
              <Button disabled={isUpdating} onClick={() => updateStatus(LeadStatus.CONVERTED)}>
                Mark Converted
              </Button>
            )}
            {(status === LeadStatus.NEW || status === LeadStatus.DRAFT_READY) && (
              <Button
                disabled={isUpdating}
                onClick={() => updateStatus(LeadStatus.IGNORED)}
                variant="outline"
              >
                Ignore
              </Button>
            )}
            {status === LeadStatus.IGNORED && (
              <Button disabled={isUpdating} onClick={() => updateStatus(LeadStatus.NEW)} variant="outline">
                Reopen
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
