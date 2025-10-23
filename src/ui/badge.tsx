import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className = "",
  children,
  ...props
}) => {
  const variants: Record<string, string> = {
    default: "bg-gray-200 text-gray-800 border border-gray-300",
    secondary: "bg-blue-100 text-blue-800 border border-blue-200",
  };
  const classes = `inline-block px-2 py-1 rounded-full text-xs font-bold ${variants[variant]} ${className}`;
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};
