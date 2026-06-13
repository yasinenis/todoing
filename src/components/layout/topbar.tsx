import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/app/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";

function usePageTitle() {
  const { pathname } = useLocation();
  const match = NAV_ITEMS.find((i) =>
    i.to === "/" ? pathname === "/" : pathname.startsWith(i.to),
  );
  return match?.label ?? "TodoIng";
}

export function Topbar() {
  const title = usePageTitle();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur safe-top md:px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground md:hidden">
          <Sparkles className="h-4 w-4" />
        </div>
        <h1 className="text-base font-semibold md:text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
