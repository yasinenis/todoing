import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/database.types";
import { useCategoryUsage, useDeleteCategory } from "./api";

interface Props {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({ category, onOpenChange }: Props) {
  const usage = useCategoryUsage(category?.id ?? null);
  const del = useDeleteCategory();

  const confirm = async () => {
    if (!category) return;
    try {
      await del.mutateAsync(category.id);
      toast.success("Kategori silindi");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Silme başarısız");
    }
  };

  const total = usage.data?.total ?? 0;

  return (
    <Dialog open={!!category} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>"{category?.name}" silinsin mi?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 pt-1">
              {usage.isLoading ? (
                <span className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Kontrol
                  ediliyor…
                </span>
              ) : total > 0 ? (
                <>
                  <p>
                    Bu kategoriye bağlı{" "}
                    <strong className="text-foreground">
                      {usage.data?.tasks ?? 0} görev
                    </strong>
                    ,{" "}
                    <strong className="text-foreground">
                      {usage.data?.goals ?? 0} hedef
                    </strong>{" "}
                    ve{" "}
                    <strong className="text-foreground">
                      {usage.data?.plans ?? 0} plan
                    </strong>{" "}
                    var.
                  </p>
                  <p>
                    Silersen bunlar <strong>"Kategorisiz"</strong> olarak
                    kalır (kayıtlar silinmez). Devam edilsin mi?
                  </p>
                </>
              ) : (
                <p>Bu kategoriye bağlı kayıt yok. Güvenle silebilirsin.</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={del.isPending || usage.isLoading}
          >
            {del.isPending ? "Siliniyor…" : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
