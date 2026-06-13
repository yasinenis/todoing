import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  // Zaten girişliyse panele yönlendir.
  if (session) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          // E-posta onayı kapalıysa kayıt sonrası direkt oturum açılır.
          navigate("/", { replace: true });
        } else {
          toast.success(
            "Kayıt oluşturuldu! E-postanı doğrulaman gerekebilir, sonra giriş yap.",
          );
          setMode("signin");
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
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Sparkles className="h-7 w-7" />
          </div>
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
              <Button type="submit" className="w-full" disabled={loading}>
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
                onClick={() =>
                  setMode(mode === "signin" ? "signup" : "signin")
                }
              >
                {mode === "signin" ? "Kayıt ol" : "Giriş yap"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
