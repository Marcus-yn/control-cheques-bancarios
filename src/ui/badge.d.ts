export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary";
  className?: string;
}

export declare const Badge: React.FC<BadgeProps>;
