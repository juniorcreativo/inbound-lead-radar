"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LeadStatus } from "@/generated/prisma/enums";

const CONFIDENCE_OPTIONS = ["high", "medium", "low", "reject"];
const STATUS_OPTIONS = Object.values(LeadStatus);

export function FilterBar({ subreddits }: { subreddits: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function reset() {
    router.replace(pathname, { scroll: false });
  }

  const subreddit = searchParams.get("subreddit") ?? "all";
  const confidence = searchParams.get("confidence") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Subreddit</Label>
        <Select value={subreddit} onValueChange={(v) => updateParam("subreddit", v)}>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {subreddits.map((s) => (
              <SelectItem key={s} value={s}>
                r/{s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Confidence</Label>
        <Select value={confidence} onValueChange={(v) => updateParam("confidence", v)}>
          <SelectTrigger size="sm" className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {CONFIDENCE_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select value={status} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input
          type="date"
          value={from}
          onChange={(e) => updateParam("from", e.target.value || null)}
          className="w-36"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input
          type="date"
          value={to}
          onChange={(e) => updateParam("to", e.target.value || null)}
          className="w-36"
        />
      </div>

      <Button variant="ghost" size="sm" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}
