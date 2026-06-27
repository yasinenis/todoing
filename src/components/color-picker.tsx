import { Check } from "lucide-react";
import { PALETTE } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE.map((color) => {
        const selected = value.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={t("colorPicker.aria", { color })}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110",
              selected && "ring-2 ring-foreground",
            )}
            style={{ backgroundColor: color }}
          >
            {selected && <Check className="h-4 w-4 text-white drop-shadow" />}
          </button>
        );
      })}
    </div>
  );
}
