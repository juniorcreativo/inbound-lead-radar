"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SubredditBreakdownChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leads by Subreddit</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leads yet.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: string) => `r/${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => `r/${label}`}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
