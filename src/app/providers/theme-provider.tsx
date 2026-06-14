import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";
export type Palette = "professional" | "masculine" | "feminine" | "emerald";

/** Ayarlar ekranında gösterilen renk temaları. */
export const PALETTES: {
  id: Palette;
  name: string;
  desc: string;
  swatch: [string, string, string];
}[] = [
  {
    id: "professional",
    name: "Profesyonel",
    desc: "Nötr, sakin — herkese uygun",
    swatch: ["#3a5bc7", "#dbe3f7", "#1e2433"],
  },
  {
    id: "masculine",
    name: "Okyanus",
    desc: "Koyu mavi & teal, güçlü",
    swatch: ["#1273b8", "#bfe6f0", "#0c2f47"],
  },
  {
    id: "feminine",
    name: "Gül",
    desc: "Pembe & lavanta, yumuşak",
    swatch: ["#e0539c", "#ecd9fb", "#5e2a52"],
  },
  {
    id: "emerald",
    name: "Zümrüt",
    desc: "Doğal yeşil, dengeli",
    swatch: ["#1f9d6b", "#bff0d8", "#10402c"],
  },
];

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  palette: Palette;
  setPalette: (palette: Palette) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "todoing-theme";
const PALETTE_KEY = "todoing-palette";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) || "system",
  );
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    theme === "system" ? getSystemTheme() : theme,
  );
  const [palette, setPaletteState] = useState<Palette>(
    () => (localStorage.getItem(PALETTE_KEY) as Palette) || "professional",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", palette);
  }, [palette]);

  useEffect(() => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  };

  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const setPalette = (next: Palette) => {
    localStorage.setItem(PALETTE_KEY, next);
    setPaletteState(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        palette,
        setPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
