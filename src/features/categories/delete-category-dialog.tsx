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
import { useI18n } from "@/i18n";
import { useCategoryUsage, useDeleteCategory } from "./api";

interface Props {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({ category, onOpenChange }: Props) {
  const { t } = useI18n();
  const usage = useCategoryUsage(category?.id ?? null);
  const del = useDeleteCategory();

  const confirm = async () => {
    if (!category) return;
    try {
      await del.mutateAsync(category.id);
      toast.success(t("categoryDelete.deleted"));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("tasks.deleteFailed"));
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
          <DialogTitle>
            {t("tasks.deleteTitle", { title: category?.name ?? "" })}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 pt-1">
              {usage.isLoading ? (
                <span className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {t("categoryDelete.checking")}
                </span>
              ) : total > 0 ? (
                <>
                  <p>
                    {t("categoryDelete.usage", {
                      tasks: usage.data?.tasks ?? 0,
                      goals: usage.data?.goals ?? 0,
                      plans: usage.data?.plans ?? 0,
                    })}
                  </p>
                  <p>{t("categoryDelete.usageNote")}</p>
                </>
              ) : (
                <p>{t("categoryDelete.noUsage")}</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={del.isPending || usage.isLoading}
          >
            {del.isPending ? t("categoryDelete.deleting") : t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
