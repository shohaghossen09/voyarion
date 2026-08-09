"use client";

import { useI18n, LANGUAGES, type Language } from "@/lib/i18n";
import { Globe, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useI18n();
  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-sm font-medium text-foreground/70 hover:text-foreground"
          aria-label="Change language"
        >
          <Globe className="w-[18px] h-[18px]" />
          {!compact && (
            <span className="hidden sm:inline text-xs uppercase tracking-wider">{current.code}</span>
          )}
          <ChevronDown className="w-3 h-3 hidden sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-surface-elevated border-border-subtle">
        <div className="px-2 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Select language</p>
        </div>
        <DropdownMenuSeparator className="bg-border-subtle" />
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={cn(
              "cursor-pointer flex items-center gap-3 py-2.5",
              language === lang.code ? "bg-gold/10" : "hover:bg-white/[0.04]"
            )}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex-1">
              <p className={cn("text-sm font-medium", language === lang.code ? "text-gold" : "text-foreground")}>
                {lang.nativeName}
              </p>
              <p className="text-[10px] text-muted-foreground">{lang.name}</p>
            </div>
            {language === lang.code && <Check className="w-4 h-4 text-gold" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
