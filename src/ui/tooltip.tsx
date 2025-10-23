import * as React from "react";

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => <span>{children}</span>;

export const TooltipTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ children }) => <>{children}</>;

export const TooltipContent: React.FC<{ children: React.ReactNode; side?: string; className?: string }> = ({ children }) => <span>{children}</span>;
