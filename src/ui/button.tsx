import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "ghost",
  size = "md",
  asChild = false,
  className = "",
  children,
  ...props
}) => {
  const base = "px-4 py-2 rounded transition-all font-semibold";
  const variants: Record<string, string> = {
    ghost: "bg-transparent hover:bg-gray-100 border border-transparent",
    outline: "bg-white border border-gray-300 hover:bg-gray-50",
    secondary: "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200",
  };
  const sizes: Record<string, string> = {
    sm: "text-xs py-1 px-2",
    md: "text-sm py-2 px-4",
    lg: "text-base py-3 px-6",
  };
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (asChild) {
    return <span className={classes}>{children}</span>;
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
