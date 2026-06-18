import { useState } from "react";
import { Download, Monitor } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  DOWNLOADS,
  RELEASES_PAGE,
  detectOS,
  downloadUrl,
  isElectron,
} from "./downloads";

interface Props {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  label?: string;
}

/** "Uygulamayı indir" — tıklanınca platform seçtiren ve direkt indiren buton. */
export function DownloadDesktopButton({
  variant = "outline",
  size,
  className,
  label = "Uygulamayı indir",
}: Props) {
  const [open, setOpen] = useState(false);

  // Masaüstü uygulamasının içindeysek indirme butonunu gösterme.
  if (isElectron()) return null;

  const current = detectOS();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Monitor className="h-4 w-4" /> {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uygulamayı indir</DialogTitle>
            <DialogDescription>
              Platformunu seç; indirme hemen başlar. Veriler web ile senkron
              çalışır.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {DOWNLOADS.map((d) => {
              const isCurrent = current === d.os;
              return (
                <a
                  key={d.id}
                  href={downloadUrl(d.file)}
                  download
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent",
                    isCurrent && "border-primary bg-primary/5",
                  )}
                >
                  <img
                    src={d.icon}
                    alt=""
                    className="h-8 w-8 shrink-0 object-contain"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-medium">
                      {d.label}
                      {isCurrent && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                          senin cihazın
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {d.note}
                    </span>
                  </span>
                  <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            İmzasız kurulum olduğundan sistem "bilinmeyen yayıncı" uyarısı
            gösterebilir; güvenle kurabilirsin.{" "}
            <a
              href={RELEASES_PAGE}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Tüm sürümler
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
