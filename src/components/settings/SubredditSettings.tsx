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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubredditConfig } from "@/generated/prisma/client";

export function SubredditSettings({ initialSubreddits }: { initialSubreddits: SubredditConfig[] }) {
  const router = useRouter();
  const [subreddits, setSubreddits] = useState(initialSubreddits);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function toggleEnabled(id: string, enabled: boolean) {
    setSubreddits((prev) => prev.map((s) => (s.id === id ? { ...s, enabled } : s)));
    await fetch(`/api/config/subreddits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    setSubreddits((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/config/subreddits/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function addSubreddit() {
    const name = newName.trim().replace(/^r\//, "");
    if (!name) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/config/subreddits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubreddits((prev) => [...prev, data.subreddit]);
        setNewName("");
        router.refresh();
      }
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monitored Subreddits</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subreddit</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {subreddits.map((s) => (
              <TableRow key={s.id}>
                <TableCell>r/{s.name}</TableCell>
                <TableCell>
                  <Switch checked={s.enabled} onCheckedChange={(v) => toggleEnabled(s.id, v)} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => remove(s.id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. forhire"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubreddit()}
          />
          <Button onClick={addSubreddit} disabled={isAdding || !newName.trim()}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
