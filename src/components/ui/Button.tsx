import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  active,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-primary/40 disabled:opacity-50 disabled:pointer-events-none active:scale-95 active:brightness-95";
  
  const variants = {
    primary: "bg-theme-primary text-white hover:bg-theme-primary/95 shadow-accent-glow tracking-tight shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5",
    secondary: "bg-theme-accent text-theme-header hover:bg-theme-accent/90 shadow-sm tracking-tight hover:-translate-y-0.5",
    outline: "border border-theme-border bg-transparent text-theme-text-primary hover:bg-theme-surface hover:border-theme-primary/30 hover:shadow-elevation-1",
    ghost: "bg-transparent text-theme-text-secondary hover:bg-theme-primary/5 hover:text-theme-text-primary",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    icon: "p-2.5",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        active && "ring-2 ring-theme-accent",
        className
      )}
      {...props}
    />
  );
};
