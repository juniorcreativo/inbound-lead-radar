"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IntentPhrase } from "@/generated/prisma/client";

export function PhraseSettings({ initialPhrases }: { initialPhrases: IntentPhrase[] }) {
  const router = useRouter();
  const [phrases, setPhrases] = useState(initialPhrases);
  const [newPhrase, setNewPhrase] = useState("");
  const [newType, setNewType] = useState<"INCLUDE" | "EXCLUDE">("INCLUDE");
  const [isAdding, setIsAdding] = useState(false);

  async function toggleEnabled(id: string, enabled: boolean) {
    setPhrases((prev) => prev.map((p) => (p.id === id ? { ...p, enabled } : p)));
    await fetch(`/api/config/phrases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    setPhrases((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/config/phrases/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function addPhrase() {
    const phrase = newPhrase.trim();
    if (!phrase) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/config/phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase, type: newType }),
      });
      if (res.ok) {
        const data = await res.json();
        setPhrases((prev) => [...prev, data.phrase]);
        setNewPhrase("");
        router.refresh();
      }
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Intent Phrases</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phrase</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {phrases.map((p) => (
              <TableRow key={p.id}>
                <TableCell>&quot;{p.phrase}&quot;</TableCell>
                <TableCell>
                  <Badge variant={p.type === "INCLUDE" ? "outline" : "destructive"}>
                    {p.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch checked={p.enabled} onCheckedChange={(v) => toggleEnabled(p.id, v)} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => remove(p.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. need a video editor"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPhrase()}
            className="flex-1"
          />
          <Select value={newType} onValueChange={(v) => setNewType(v as "INCLUDE" | "EXCLUDE")}>
            <SelectTrigger size="sm" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCLUDE">Include</SelectItem>
              <SelectItem value="EXCLUDE">Exclude</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addPhrase} disabled={isAdding || !newPhrase.trim()}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
