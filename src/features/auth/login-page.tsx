import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadDesktopButton } from "@/features/desktop/download-desktop";
import { USERNAME_RE, checkUsernameAvailable } from "@/features/profile/api";

type UsernameStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken";

export function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  // Kullanıcı adı uygunluğunu (debounce ile) denetle.
  useEffect(() => {
    if (mode !== "signup") return;
    if (!username) {
      setUsernameStatus("idle");
      return;
    }
    if (!USERNAME_RE.test(username)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      try {
        const ok = await checkUsernameAvailable(username);
        setUsernameStatus(ok ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [username, mode]);

  if (session) return <Navigate to="/" replace />;

  const mismatch =
    mode === "signup" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const canSubmit =
    !loading &&
    (mode === "signin" ||
      (usernameStatus === "available" &&
        confirmPassword.length > 0 &&
        password === confirmPassword));

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setConfirmPassword("");
    setUsername("");
    setUsernameStatus("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      if (usernameStatus !== "available") {
        toast.error("Lütfen uygun bir kullanıcı adı seç.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Parolalar eşleşmiyor.");
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/", { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) throw error;
        if (data.session) {
          navigate("/", { replace: true });
        } else {
          toast.success(
            "Kayıt oluşturuldu! E-postanı doğrulaman gerekebilir, sonra giriş yap.",
          );
          setMode("signin");
          setConfirmPassword("");
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Bir şeyler ters gitti.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <img
            src="/icon-512.png"
            alt="TodoIng"
            className="h-32 w-32 object-contain drop-shadow-md"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TodoIng</h1>
            <p className="text-sm text-muted-foreground">
              Görevlerin, hedeflerin ve alışkanlıkların tek yerde.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="username">Kullanıcı adı</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.replace(/\s/g, ""))
                      }
                      placeholder="ornek_kullanici"
                      className="pr-9"
                      aria-invalid={
                        usernameStatus === "taken" ||
                        usernameStatus === "invalid"
                      }
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {usernameStatus === "checking" && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {usernameStatus === "available" && (
                        <Check className="h-4 w-4 text-success" />
                      )}
                      {(usernameStatus === "taken" ||
                        usernameStatus === "invalid") && (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </span>
                  </div>
                  <p
                    className={
                      usernameStatus === "taken" || usernameStatus === "invalid"
                        ? "text-xs font-medium text-destructive"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {usernameStatus === "taken"
                      ? "Bu kullanıcı adı alınmış."
                      : usernameStatus === "invalid"
                        ? "3-20 karakter; harf, rakam ve alt çizgi."
                        : usernameStatus === "available"
                          ? "Uygun ✓"
                          : "3-20 karakter; harf, rakam ve alt çizgi."}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Parola</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Parola (tekrar)</Label>
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    aria-invalid={mismatch}
                    className={mismatch ? "border-destructive" : undefined}
                  />
                  {mismatch && (
                    <p className="text-xs font-medium text-destructive">
                      Parolalar eşleşmiyor.
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {loading
                  ? "Lütfen bekle…"
                  : mode === "signin"
                    ? "Giriş yap"
                    : "Kayıt ol"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={switchMode}
              >
                {mode === "signin" ? "Kayıt ol" : "Giriş yap"}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-center">
          <DownloadDesktopButton variant="ghost" size="sm" />
        </div>
      </div>
    </div>
  );
}
