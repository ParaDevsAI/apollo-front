import { ButtonHTMLAttributes } from "react";
import { ArrowRight } from "lucide-react";

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "primary" | "transparent" | "outline";
  showIcon?: boolean;
}

export default function BaseButton({ 
  children, 
  className = "", 
  variant = "primary", 
  showIcon = false,
  ...props 
}: BaseButtonProps) {
  
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return `text-[var(--color-button-text)] bg-[var(--color-button-bg)] 
          border border-[var(--color-button-border)] 
          shadow-[0_5px_0_0_var(--color-button-shadow)] 
          active:translate-y-[1px]`;
      
      case "transparent":
        return `text-[var(--color-text-primary)] bg-transparent 
          border border-[var(--color-text-primary)] 
          hover:bg-[var(--color-text-primary)] hover:text-black 
          active:scale-95`;
      
      case "outline":
        return `text-[var(--color-primary)] bg-transparent 
          border border-[var(--color-primary)] 
          hover:bg-[var(--color-primary)] hover:text-white 
          active:scale-95`;
      
      default:
        return `text-[var(--color-button-text)] bg-[var(--color-button-bg)] 
          border border-[var(--color-button-border)] 
          shadow-[0_6px_0_0_var(--color-button-shadow)] 
          active:translate-y-[1px]`;
    }
  };

  return (
    <button
      {...props}
      className={`group rounded-full transition-all duration-300
        disabled:cursor-not-allowed disabled:opacity-50 
        ${getVariantClasses()}
        ${className}`}
    >
      <div className="flex items-center">
        <span>{children}</span>
        {(variant === "primary" || showIcon) && (
          <div 
            className={`w-0 group-hover:w-6 h-4 group-hover:h-6 bg-black rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden ${
              variant === "primary" 
                ? "opacity-0 group-hover:opacity-100 group-hover:ml-2" 
                : ""
            }`}
          >
            <ArrowRight className="w-2 h-2 group-hover:w-3 group-hover:h-3 text-white transition-all duration-300" />
          </div>
        )}
      </div>
    </button>
  );
}
