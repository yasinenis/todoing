import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/color-picker";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/colors";
import type { Category } from "@/lib/database.types";
import { useI18n } from "@/i18n";
import { useCreateCategory, useUpdateCategory } from "./api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_CATEGORY_COLOR);
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const isEdit = !!category;

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setColor(category?.color ?? DEFAULT_CATEGORY_COLOR);
    }
  }, [open, category]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (isEdit) {
        await update.mutateAsync({ id: category.id, name: name.trim(), color });
        toast.success(t("categoryForm.updated"));
      } else {
        await create.mutateAsync({ name: name.trim(), color });
        toast.success(t("categoryForm.created"));
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("taskForm.failed"));
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("categoryForm.editTitle") : t("categoryForm.newTitle")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">{t("habitForm.name")}</Label>
            <Input
              id="cat-name"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder={t("categoryForm.namePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("habitForm.color")}</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {isEdit ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
