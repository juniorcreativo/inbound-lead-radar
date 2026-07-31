"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DraftEditor({
  leadId,
  initialDraft,
  hasExistingDraft,
}: {
  leadId: string;
  initialDraft: string;
  hasExistingDraft: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmRegenOpen, setConfirmRegenOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateDraft() {
    setError(null);
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/draft`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to generate draft");
        return;
      }
      const data = await res.json();
      setDraft(data.lead.draftReply ?? "");
      router.refresh();
    } finally {
      setIsGenerating(false);
      setConfirmRegenOpen(false);
    }
  }

  async function saveDraft() {
    setIsSaving(true);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftReply: draft }),
      });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        placeholder="No draft yet - generate one below."
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          disabled={isGenerating}
          onClick={() => (hasExistingDraft ? setConfirmRegenOpen(true) : generateDraft())}
        >
          {isGenerating ? "Generating..." : hasExistingDraft ? "Regenerate" : "Generate Draft"}
        </Button>
        <Button variant="outline" disabled={isSaving} onClick={saveDraft}>
          {isSaving ? "Saving..." : "Save Edits"}
        </Button>
        <Button variant="ghost" disabled={!draft} onClick={copyToClipboard}>
          {copied ? "Copied!" : "Copy to clipboard"}
        </Button>
      </div>

      <Dialog open={confirmRegenOpen} onOpenChange={setConfirmRegenOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate draft?</DialogTitle>
            <DialogDescription>
              This will overwrite the current draft text, including any edits you&apos;ve made.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRegenOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generateDraft} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Regenerate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
