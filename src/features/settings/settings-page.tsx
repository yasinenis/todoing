import { useState } from "react";
import {
  Check,
  Languages,
  Monitor,
  Moon,
  RefreshCw,
  Sun,
  Volume2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme, PALETTES } from "@/app/providers/theme-provider";
import { useI18n, type Lang } from "@/i18n";
import { useAuth } from "@/app/providers/auth-provider";
import { DownloadDesktopButton } from "@/features/desktop/download-desktop";
import { isNativeApp } from "@/features/desktop/downloads";
import { useElectronUpdate } from "@/features/desktop/electron-update";
import { ProfileCard } from "@/features/profile/profile-card";
import { getSoundEnabled, setSoundEnabled } from "@/lib/sound";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", labelKey: "settings.theme.light", icon: Sun },
  { value: "dark", labelKey: "settings.theme.dark", icon: Moon },
  { value: "system", labelKey: "settings.theme.system", icon: Monitor },
] as const;

const LANGS: { value: Lang; label: string }[] = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
];

export function SettingsPage() {
  const { theme, setTheme, palette, setPalette } = useTheme();
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const update = useElectronUpdate();
  const [soundOn, setSoundOn] = useState(getSoundEnabled());

  const toggleSound = (v: boolean) => {
    setSoundEnabled(v);
    setSoundOn(v);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} description={t("settings.desc")} />

      <ProfileCard />

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(({ value, labelKey, icon: Icon }) => (
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
                {t(labelKey)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t("settings.language")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            {t("settings.languageDesc")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {LANGS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLang(l.value)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-colors",
                  lang === l.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:bg-accent",
                )}
              >
                {l.label}
                {lang === l.value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.colorTheme")}</CardTitle>
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
                  <span className="block font-medium">{t(p.nameKey)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t(p.descKey)}
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
          <CardTitle>{t("settings.sound")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Volume2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium">{t("settings.appSounds")}</p>
              <p className="text-xs text-muted-foreground">
                {t("settings.appSoundsDesc")}
              </p>
            </div>
          </div>
          <Switch
            checked={soundOn}
            onCheckedChange={toggleSound}
            aria-label={t("settings.sound")}
          />
        </CardContent>
      </Card>

      {!isNativeApp() && (
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.download")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("settings.downloadDesc")}
            </p>
            <DownloadDesktopButton />
          </CardContent>
        </Card>
      )}

      {update.supported && (
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.updates")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {update.downloaded
                  ? `${t("settings.updateReady")}${update.version ? ` (${update.version})` : ""}`
                  : t("settings.autoUpdateOn")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("settings.updateDesc")}
              </p>
            </div>
            {update.downloaded ? (
              <Button onClick={update.install}>{t("settings.updateNow")}</Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => update.check()}
                disabled={update.checking}
              >
                <RefreshCw
                  className={cn("h-4 w-4", update.checking && "animate-spin")}
                />
                {update.checking
                  ? t("settings.checking")
                  : t("settings.checkUpdates")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.account")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">
              {t("settings.signedIn")}
            </p>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            {t("common.signOut")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
