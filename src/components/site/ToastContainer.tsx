"use client";

import { useAppStore } from "@/store/useAppStore";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: "text-green-500 border-green-500/20 bg-green-500/5",
    error: "text-destructive border-destructive/20 bg-destructive/5",
    info: "text-gold border-gold/20 bg-gold/5",
    warning: "text-amber-500 border-amber-500/20 bg-amber-500/5",
  };

  return (
    <div className="fixed top-20 right-4 z-[110] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-card shadow-premium animate-fade-in-up",
              colors[t.type]
            )}
          >
            <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", colors[t.type].split(" ")[0])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.message && <p className="text-xs text-muted-foreground mt-0.5">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
