"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "secondary";
    size?: "sm" | "md" | "icon";
  }
>(({ className, variant = "default", size = "md", ...props }, ref) => {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-1.5";
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-transparent hover:bg-secondary",
    ghost: "hover:bg-secondary",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3",
    md: "h-9 px-4",
    icon: "h-8 w-8",
  };
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});
Button.displayName = "Button";
