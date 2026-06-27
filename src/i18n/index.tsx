import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { enUS, tr as trLocale } from "date-fns/locale";
import { setDateLocale } from "@/lib/date";
import { setDurationLang } from "@/lib/utils";
import { translations, type Lang } from "./translations";

export type { Lang };

const STORAGE_KEY = "todoing-lang";

export function getStoredLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "tr" || saved === "en") return saved;
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "tr";
}

type Vars = Record<string, string | number>;
type TFunc = (key: string, vars?: Vars) => string;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunc;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function applyLocale(lang: Lang) {
  document.documentElement.lang = lang;
  setDateLocale(lang === "en" ? enUS : trLocale);
  setDurationLang(lang);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang);

  // İlk render'da da tarih yereli doğru olsun.
  useState(() => applyLocale(lang));

  useEffect(() => {
    applyLocale(lang);
  }, [lang]);

  const setLang = (next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  };

  const t = useCallback<TFunc>(
    (key, vars) => {
      let s = translations[lang][key] ?? translations.tr[key] ?? key;
      if (vars) {
        for (const k of Object.keys(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
        }
      }
      return s;
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
