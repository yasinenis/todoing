import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_ITEMS } from "@/app/nav";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/** Mobilde tüm sayfalara erişim (alt navigasyonda olmayanlar dahil). */
export function MobileNavMenu() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t("topbar.menu")}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[12rem]">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <DropdownMenuItem key={to} asChild>
              <Link
                to={to}
                className={cn(active && "text-primary font-medium")}
              >
                <Icon className="h-4 w-4" /> {t(label)}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
