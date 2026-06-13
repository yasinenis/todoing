import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { hexToRgba } from "@/lib/colors";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  color?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "#a78bfa",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: hexToRgba(color, 0.18) }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-bold leading-tight">{value}</p>
          <p className="truncate text-xs text-muted-foreground">
            {label}
            {hint ? ` · ${hint}` : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
