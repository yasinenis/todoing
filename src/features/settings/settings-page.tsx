import { Monitor, Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/theme-provider";
import { useAuth } from "@/app/providers/auth-provider";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Açık", icon: Sun },
  { value: "dark", label: "Koyu", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
] as const;

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="Ayarlar" description="Görünüm ve hesap tercihlerin." />

      <Card>
        <CardHeader>
          <CardTitle>Görünüm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors",
                  theme === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:bg-accent",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hesap</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Giriş yapıldı</p>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Çıkış yap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
