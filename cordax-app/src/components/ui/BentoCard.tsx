import React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode; // "Upload" 버튼이나 "Edit" 아이콘 등을 넣을 자리
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
        "group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-surface text-slate-950 shadow-bento transition-all duration-200 hover:shadow-bento-hover",
        className
      )}
      {...props}
    >
      {/* Header (Optional) */}
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          {title && (
            <h3 className="font-semibold tracking-tight text-slate-900">
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className={cn("flex-1", noPadding ? "p-0" : "p-6")}>
        {children}
      </div>
    </div>
  );
}