import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
