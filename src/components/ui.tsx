// 通用 UI 原子组件（无状态，服务端/客户端组件均可使用）
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const styles = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 disabled:hover:bg-slate-300",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400",
    ghost: "text-slate-600 hover:bg-slate-100",
  }[variant];
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        styles,
        className
      )}
      {...props}
    />
  );
}

/** 链接按钮的样式（用于 <Link>/<a>） */
export const buttonLinkStyles = {
  primary:
    "inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700",
  outline:
    "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "positive" | "negative" | "neutral" | "brand";
  className?: string;
  children: ReactNode;
}) {
  const tones = {
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    negative: "bg-amber-50 text-amber-700 ring-amber-600/25",
    neutral: "bg-slate-100 text-slate-600 ring-slate-500/20",
    brand: "bg-emerald-600 text-white ring-emerald-600",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones,
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex min-w-0 items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
