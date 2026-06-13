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
import { useCreateCategory, useUpdateCategory } from "./api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: Props) {
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
        toast.success("Kategori güncellendi");
      } else {
        await create.mutateAsync({ name: name.trim(), color });
        toast.success("Kategori oluşturuldu");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Kategoriyi düzenle" : "Yeni kategori"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Ad</Label>
            <Input
              id="cat-name"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="ör. İş, Spor, Okuma"
            />
          </div>
          <div className="space-y-2">
            <Label>Renk</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {isEdit ? "Kaydet" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
