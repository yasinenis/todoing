import { Loader2 } from "lucide-react";

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
    </div>
  );
}
