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
  DESKTOP_DOWNLOADS,
  RELEASES_PAGE,
  detectOS,
  downloadUrl,
  isElectron,
  type DesktopOS,
} from "./downloads";

const ORDER: DesktopOS[] = ["windows", "linux", "mac"];

interface Props {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  label?: string;
}

/** "Masaüstü uygulamasını indir" — tıklanınca OS seçtiren ve direkt indiren buton. */
export function DownloadDesktopButton({
  variant = "outline",
  size,
  className,
  label = "Masaüstü uygulamasını indir",
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
            <DialogTitle>Masaüstü uygulamasını indir</DialogTitle>
            <DialogDescription>
              İşletim sistemini seç; indirme hemen başlar. Veriler web ile
              senkron çalışır.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {ORDER.map((os) => {
              const item = DESKTOP_DOWNLOADS[os];
              const isCurrent = current === os;
              return (
                <a
                  key={os}
                  href={downloadUrl(os)}
                  download
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent",
                    isCurrent && "border-primary bg-primary/5",
                  )}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-medium">
                      {item.label}
                      {isCurrent && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                          senin sistemin
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.note}
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
