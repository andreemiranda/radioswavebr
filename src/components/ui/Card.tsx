import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, active, ...props }) => {
  return (
    <div
      className={cn(
        // Base
        "bg-brasil-white text-brasil-green rounded-2xl p-4 border-2 border-transparent",
        // Sombra padrão
        "shadow-[0_2px_8px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)]",
        // Transição suave em todas as propriedades
        "transition-all duration-300 ease-out",
        // Hover: eleva, sombra verde, borda suave
        "hover:shadow-[0_8px_32px_rgba(0,156,59,0.15),0_2px_8px_rgba(0,0,0,0.08)]",
        "hover:-translate-y-1.5",
        "hover:border-brasil-yellow/40",
        // Estado ativo
        active && "border-brasil-yellow ring-2 ring-brasil-yellow/30 shadow-[0_4px_24px_rgba(255,223,0,0.2),0_2px_8px_rgba(0,0,0,0.08)]",
        className
      )}
      {...props}
    />
  );
};
