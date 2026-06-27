import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n";
import {
  USERNAME_RE,
  avatarUrl,
  useMyProfile,
  useUpdateUsername,
  useUploadAvatar,
} from "./api";

export function ProfileCard() {
  const { t } = useI18n();
  const { data: profile, isLoading } = useMyProfile();
  const updateUsername = useUpdateUsername();
  const uploadAvatar = useUploadAvatar();
  const fileInput = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");

  useEffect(() => {
    if (profile) setUsername(profile.username ?? "");
  }, [profile]);

  const url = avatarUrl(profile?.avatar_path);
  const dirty = username !== (profile?.username ?? "");
  const valid = USERNAME_RE.test(username);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      await uploadAvatar.mutateAsync(f);
      toast.success(t("profile.photoUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.uploadFailed"));
    }
  };

  const saveUsername = async () => {
    if (!valid) {
      toast.error(t("auth.usernameInvalid"));
      return;
    }
    try {
      await updateUsername.mutateAsync(username);
      toast.success(t("profile.usernameSaved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.saveFailed"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("profile.loading")}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground">
                {url ? (
                  <img
                    src={url}
                    alt={t("profile.title")}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-7 w-7" />
                )}
              </span>
              <div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickFile}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploadAvatar.isPending}
                >
                  <ImagePlus className="h-4 w-4" />
                  {uploadAvatar.isPending
                    ? t("profile.uploading")
                    : t("profile.changePhoto")}
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("profile.shownOnLeaderboard")}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-username">{t("auth.username")}</Label>
              <div className="flex gap-2">
                <Input
                  id="profile-username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/\s/g, ""))
                  }
                  placeholder={t("profile.usernamePlaceholder")}
                />
                <Button
                  onClick={saveUsername}
                  disabled={!dirty || !valid || updateUsername.isPending}
                >
                  {t("common.save")}
                </Button>
              </div>
              {!profile?.username && (
                <p className="text-xs text-muted-foreground">
                  {t("profile.setUsernameHint")}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
