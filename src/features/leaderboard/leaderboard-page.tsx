import { useState } from "react";
import { Trophy, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatDuration } from "@/lib/utils";
import { avatarUrl, useMyProfile } from "@/features/profile/api";
import { useLeaderboard, type LeaderboardPeriod } from "./api";

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "daily", label: "Günlük" },
  { value: "weekly", label: "Haftalık" },
  { value: "monthly", label: "Aylık" },
  { value: "yearly", label: "Yıllık" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

function Avatar({
  path,
  name,
  className,
}: {
  path: string | null;
  name: string | null;
  className?: string;
}) {
  const url = avatarUrl(path);
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {url ? (
        <img src={url} alt={name ?? ""} className="h-full w-full object-cover" />
      ) : name ? (
        <span className="text-sm font-semibold uppercase">
          {name.slice(0, 2)}
        </span>
      ) : (
        <UserIcon className="h-5 w-5" />
      )}
    </span>
  );
}

export function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const { data: rows, isLoading } = useLeaderboard(period);
  const { data: me } = useMyProfile();

  return (
    <div>
      <PageHeader
        title="Liderlik"
        description="En çok çalışanlar. Sıralamada görünmek için kullanıcı adı belirle."
      />

      <div className="mb-4">
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}
        >
          <TabsList>
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !rows?.length ? (
        <EmptyState
          icon={Trophy}
          title="Henüz sıralama yok"
          description="Bu dönemde kayıtlı çalışma yok. Sayaçla çalışınca burada görünürsün."
        />
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const rank = i + 1;
            const isMe = me?.id === row.user_id;
            return (
              <Card
                key={row.user_id}
                className={cn(
                  "flex items-center gap-3 p-3",
                  isMe && "ring-2 ring-primary/50",
                )}
              >
                <span className="w-8 shrink-0 text-center text-lg font-bold tabular-nums">
                  {rank <= 3 ? MEDALS[rank - 1] : rank}
                </span>
                <Avatar path={row.avatar_path} name={row.username} />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {row.username ?? "Anonim"}
                  {isMe && (
                    <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                      sen
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                  {formatDuration(row.seconds, true)}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
