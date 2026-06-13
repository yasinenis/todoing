import { NavLink } from "react-router-dom";
import { PRIMARY_NAV } from "@/app/nav";
import { cn } from "@/lib/utils";

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur safe-bottom">
      <div className="grid grid-cols-5">
        {PRIMARY_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn("h-5 w-5", isActive && "fill-primary/15")}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
