import React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  action?: React.ReactNode; 
  noPadding?: boolean;
}

export function BentoCard({ 
  title, 
  action, 
  children, 
  className, 
  noPadding = false,
  ...props 
}: BentoCardProps) {
  return (
    <div 
      className={cn(
        "flex flex-col overflow-hidden rounded-xl bg-surface border border-border shadow-card transition-all duration-300 hover:shadow-float",
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-white">
          {title && (
            // Changed from <h3> to <div> to allow complex content like flex containers
            <div className="font-semibold text-sm tracking-tight text-slate-900 flex items-center gap-2">
              {title}
            </div>
          )}
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn("flex-1 bg-surface", noPadding ? "p-0" : "p-5")}>
        {children}
      </div>
    </div>
  );
}