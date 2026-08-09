"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode, useEffect, useState } from "react";

// ============================================================
// SCROLL ANIMATION COMPONENTS
// Content is always visible; animations are enhancements
// ============================================================

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

interface ScrollAnimationProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "fadeInUp" | "fadeIn" | "scaleIn" | "slideInLeft" | "slideInRight";
  once?: boolean;
}

const variantMap = {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
};

export function ScrollAnimation({
  children,
  delay = 0,
  className,
  variant = "fadeInUp",
  once = true,
}: ScrollAnimationProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.1 });
  const [mounted, setMounted] = useState(false);

  // After mount, if IntersectionObserver doesn't fire within 500ms, show content anyway
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const selectedVariant = variantMap[variant];
  const shouldShow = isInView || mounted;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={shouldShow ? "visible" : "hidden"}
      variants={{
        ...selectedVariant,
        visible: {
          ...selectedVariant.visible,
          transition: {
            ...(selectedVariant.visible as any).transition,
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for lists of items
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.05 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const shouldShow = isInView || mounted;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={shouldShow ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger item — use inside StaggerContainer
export function StaggerItem({
  children,
  className,
  variant = "fadeInUp",
}: {
  children: ReactNode;
  className?: string;
  variant?: "fadeInUp" | "fadeIn" | "scaleIn" | "slideInLeft" | "slideInRight";
}) {
  const selectedVariant = variantMap[variant];

  return (
    <motion.div className={className} variants={selectedVariant}>
      {children}
    </motion.div>
  );
}
