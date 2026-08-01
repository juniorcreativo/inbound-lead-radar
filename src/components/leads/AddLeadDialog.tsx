"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EMPTY_FORM = {
  url: "",
  subreddit: "",
  author: "",
  title: "",
  fullText: "",
};

export function AddLeadDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to add lead");
        return;
      }
      setForm(EMPTY_FORM);
      setOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>+ Add Lead</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a lead manually</DialogTitle>
          <DialogDescription>
            Found a post yourself while browsing Reddit? Paste the details here - it'll run
            through the same classification and draft-generation pipeline as automated finds.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">Reddit URL</Label>
            <Input
              id="url"
              required
              value={form.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://reddit.com/r/forhire/comments/..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subreddit">Subreddit (optional - auto-detected from URL)</Label>
            <Input
              id="subreddit"
              value={form.subreddit}
              onChange={(e) => update("subreddit", e.target.value)}
              placeholder="forhire"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="author">Author (username)</Label>
            <Input
              id="author"
              required
              value={form.author}
              onChange={(e) => update("author", e.target.value)}
              placeholder="username"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title (leave blank for a comment)</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullText">Full post/comment text</Label>
            <Textarea
              id="fullText"
              required
              rows={6}
              value={form.fullText}
              onChange={(e) => update("fullText", e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
