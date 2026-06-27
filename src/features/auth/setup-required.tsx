import { Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";

/** Supabase ortam değişkenleri tanımlı değilse gösterilen kurulum ekranı. */
export function SetupRequired() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Database className="h-6 w-6" />
          </div>
          <CardTitle>{t("setup.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{t("setup.intro")}</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              {t("setup.step1")}{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                supabase.com
              </a>
            </li>
            <li>
              {t("setup.step2")}{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">
                supabase/migrations
              </code>
            </li>
            <li>
              {t("setup.step3")}{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">.env.local</code>
            </li>
          </ol>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs text-foreground">
            {`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
          </pre>
          <p>{t("setup.restart")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
