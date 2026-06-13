import { Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Supabase ortam değişkenleri tanımlı değilse gösterilen kurulum ekranı. */
export function SetupRequired() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Database className="h-6 w-6" />
          </div>
          <CardTitle>Supabase kurulumu gerekli</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Uygulamanın çalışması için bir Supabase projesi bağlamalısın.
            Aşağıdaki adımları izle:
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                supabase.com
              </a>{" "}
              üzerinden ücretsiz bir proje oluştur.
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5">
                supabase/migrations
              </code>{" "}
              içindeki SQL'i SQL Editor'da çalıştır.
            </li>
            <li>
              Proje köküne{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">.env.local</code>{" "}
              dosyası ekle:
            </li>
          </ol>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs text-foreground">
            {`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
          </pre>
          <p>Ardından geliştirme sunucusunu yeniden başlat.</p>
        </CardContent>
      </Card>
    </div>
  );
}
