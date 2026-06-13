/** Kategori ve alışkanlıklar için pastel renk paleti. */
export const PALETTE = [
  "#a78bfa", // lavanta
  "#f9a8d4", // pembe
  "#fca5a5", // mercan
  "#fdba74", // şeftali
  "#fcd34d", // sarı
  "#86efac", // yeşil
  "#5eead4", // turkuaz
  "#7dd3fc", // gök
  "#93c5fd", // mavi
  "#c4b5fd", // mor
  "#f0abfc", // orkide
  "#cbd5e1", // gri
] as const;

export const DEFAULT_CATEGORY_COLOR = PALETTE[0];
export const DEFAULT_HABIT_COLOR = "#34d399";

/** "Kategorisiz" sanal kategori (category_id = null). */
export const UNCATEGORIZED = {
  id: null,
  name: "Kategorisiz",
  color: "#cbd5e1",
} as const;

/** Hex rengi RGBA'ya çevirir (heatmap tonlaması vb. için). */
export function hexToRgba(hex: string, alpha = 1): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
