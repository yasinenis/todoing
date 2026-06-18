import { useState } from "react";
import { Check, Monitor, Moon, RefreshCw, Sun, Volume2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme, PALETTES } from "@/app/providers/theme-provider";
import { useAuth } from "@/app/providers/auth-provider";
import { DownloadDesktopButton } from "@/features/desktop/download-desktop";
import { isNativeApp } from "@/features/desktop/downloads";
import { useElectronUpdate } from "@/features/desktop/electron-update";
import { ProfileCard } from "@/features/profile/profile-card";
import { getSoundEnabled, setSoundEnabled } from "@/lib/sound";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Açık", icon: Sun },
  { value: "dark", label: "Koyu", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
] as const;

export function SettingsPage() {
  const { theme, setTheme, palette, setPalette } = useTheme();
  const { user, signOut } = useAuth();
  const update = useElectronUpdate();
  const [soundOn, setSoundOn] = useState(getSoundEnabled());

  const toggleSound = (v: boolean) => {
    setSoundEnabled(v);
    setSoundOn(v);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Ayarlar" description="Görünüm ve hesap tercihlerin." />

      <ProfileCard />

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
          <CardTitle>Renk teması</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  palette === p.id
                    ? "border-primary bg-primary/10"
                    : "hover:bg-accent",
                )}
              >
                <span className="flex -space-x-1.5">
                  {p.swatch.map((c) => (
                    <span
                      key={c}
                      className="h-7 w-7 rounded-full border-2 border-card"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {p.desc}
                  </span>
                </span>
                {palette === p.id && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ses</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Volume2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium">Uygulama sesleri</p>
              <p className="text-xs text-muted-foreground">
                Görev/alışkanlık tamamlama, sayaç ve dokunma sesleri.
              </p>
            </div>
          </div>
          <Switch
            checked={soundOn}
            onCheckedChange={toggleSound}
            aria-label="Sesler"
          />
        </CardContent>
      </Card>

      {!isNativeApp() && (
        <Card>
          <CardHeader>
            <CardTitle>Uygulamayı indir</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-sm text-sm text-muted-foreground">
              Windows, Linux, macOS veya Android (.apk) sürümünü indir. Hepsi
              web ile aynı veriyi kullanır, senkron çalışır.
            </p>
            <DownloadDesktopButton />
          </CardContent>
        </Card>
      )}

      {update.supported && (
        <Card>
          <CardHeader>
            <CardTitle>Uygulama güncellemeleri</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {update.downloaded
                  ? `Yeni sürüm hazır${update.version ? ` (${update.version})` : ""}`
                  : "Otomatik güncelleme açık"}
              </p>
              <p className="text-xs text-muted-foreground">
                Yeni sürüm yayınlanınca otomatik indirilir; kapatınca kurulur.
              </p>
            </div>
            {update.downloaded ? (
              <Button onClick={update.install}>Şimdi güncelle</Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => update.check()}
                disabled={update.checking}
              >
                <RefreshCw
                  className={cn("h-4 w-4", update.checking && "animate-spin")}
                />
                {update.checking ? "Denetleniyor…" : "Güncellemeleri denetle"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
