import { useState } from "react";
import { Plus, Tags, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@/lib/database.types";
import { useCategories } from "./api";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Kategoriler"
        description="Görev, hedef ve planlarını renkli kategorilerle düzenle."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Yeni kategori
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !categories?.length ? (
        <EmptyState
          icon={Tags}
          title="Henüz kategori yok"
          description="İlk kategorini oluştur; görev ve hedeflerini düzenli tut."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Yeni kategori
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-9 w-9 shrink-0 rounded-xl"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate font-medium">{cat.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(cat)}
                  aria-label="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleting(cat)}
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
      />
      <DeleteCategoryDialog
        category={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}
