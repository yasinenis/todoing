import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

interface UpdaterApi {
  isElectron: boolean;
  onAvailable: (cb: (d: { version: string }) => void) => void;
  onProgress: (cb: (d: { percent: number }) => void) => void;
  onDownloaded: (cb: (d: { version: string }) => void) => void;
  onError: (cb: (d: { message: string }) => void) => void;
  check: () => Promise<{ ok: boolean; version?: string | null; error?: string }>;
  install: () => Promise<void> | void;
  openReleases: () => Promise<void> | void;
}

declare global {
  interface Window {
    electronUpdater?: UpdaterApi;
  }
}

interface ElectronUpdateContextValue {
  /** Masaüstü (Electron) uygulamasında mıyız? */
  supported: boolean;
  /** Bulunan/indirilen sürüm. */
  version: string | null;
  /** İndirildi, kuruluma hazır mı? */
  downloaded: boolean;
  checking: boolean;
  check: () => Promise<void>;
  install: () => void;
}

const Ctx = createContext<ElectronUpdateContextValue | undefined>(undefined);

export function ElectronUpdateProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const api = typeof window !== "undefined" ? window.electronUpdater : undefined;
  const supported = !!api;
  const [version, setVersion] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [checking, setChecking] = useState(false);
  const sawUpdate = useRef(false);
  const downloadedRef = useRef(false);

  useEffect(() => {
    if (!api) return;
    api.onAvailable((d) => {
      sawUpdate.current = true;
      setVersion(d.version);
      toast(t("update.foundTitle"), {
        description: t("update.foundDesc", { version: d.version }),
      });
    });
    api.onDownloaded((d) => {
      downloadedRef.current = true;
      setVersion(d.version);
      setDownloaded(true);
      toast.success(t("update.readyTitle"), {
        description: t("update.readyDesc", { version: d.version }),
        duration: 15000,
        action: { label: t("update.installNow"), onClick: () => api.install() },
      });
    });
    // Arka plan hataları sessiz geçilir (ör. .deb/imzasız hedeflerde).
  }, [api, t]);

  const install = () => api?.install();

  const check = async () => {
    if (!api) return;
    sawUpdate.current = false;
    setChecking(true);
    const res = await api.check();
    setChecking(false);
    if (!res.ok) {
      if (res.error && res.error !== "dev") {
        toast.message(t("update.checkFailedTitle"), {
          description: t("update.checkFailedDesc"),
          action: {
            label: t("update.openReleases"),
            onClick: () => api.openReleases(),
          },
        });
      }
      return;
    }
    // 'update-available' tetiklenmezse güncel demektir.
    setTimeout(() => {
      if (!sawUpdate.current && !downloadedRef.current) {
        toast(t("update.upToDate"));
      }
    }, 1500);
  };

  return (
    <Ctx.Provider
      value={{ supported, version, downloaded, checking, check, install }}
    >
      {children}
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useElectronUpdate() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useElectronUpdate must be used within ElectronUpdateProvider");
  return ctx;
}
