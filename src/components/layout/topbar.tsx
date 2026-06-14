import { Link, useLocation } from "react-router-dom";
import { Timer } from "lucide-react";
import { NAV_ITEMS } from "@/app/nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileNavMenu } from "./mobile-nav-menu";

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
      <div className="flex items-center gap-1.5">
        <MobileNavMenu />
        <img
          src="/icon-512.png"
          alt="TodoIng"
          className="h-8 w-8 rounded-lg object-contain md:hidden"
        />
        <h1 className="text-base font-semibold md:text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Tam ekran sayaç"
        >
          <Link to="/timer">
            <Timer className="h-5 w-5" />
          </Link>
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
