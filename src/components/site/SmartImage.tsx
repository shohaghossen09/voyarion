"use client";

import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fallbackText?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80";
const LOAD_TIMEOUT_MS = 4000; // Show fallback if image doesn't load in 4 seconds

/**
 * SmartImage — robust image component with graceful fallback.
 * - Shows a loading shimmer while image loads
 * - Retries once on error with a known-good fallback image
 * - Times out after 4 seconds and shows fallback if image is stuck loading
 * - Shows elegant gradient placeholder with icon if all attempts fail
 */
export function SmartImage({ src, alt, className, loading = "lazy", fallbackText }: SmartImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [retryCount, setRetryCount] = useState(0);

  const currentSrc = retryCount === 1 ? FALLBACK_IMAGE : src;

  // Timeout: if image doesn't load within LOAD_TIMEOUT_MS, try fallback or show error
  useEffect(() => {
    if (status === "loaded" || status === "error") return;

    const timer = setTimeout(() => {
      if (retryCount === 0) {
        setRetryCount(1);
        setStatus("loading");
      } else {
        setStatus("error");
      }
    }, LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [status, retryCount]);

  const handleError = () => {
    if (retryCount === 0) {
      setRetryCount(1);
      setStatus("loading");
    } else {
      setStatus("error");
    }
  };

  const handleLoad = () => {
    setStatus("loaded");
  };

  if (status === "error") {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-surface via-surface-elevated to-surface",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
          <ImageOff className="w-8 h-8" />
          {fallbackText && <span className="text-[10px] uppercase tracking-wider font-medium">{fallbackText}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading shimmer */}
      {status === "loading" && (
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-elevated to-surface animate-pulse" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          status === "loading" && "opacity-0",
          status === "loaded" && "opacity-100"
        )}
      />
    </div>
  );
}
