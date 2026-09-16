// 轻量内联 SVG 图标（24×24 描边风格），避免额外依赖
import type { SVGProps } from "react";

export type IconComponent = (
  props: SVGProps<SVGSVGElement>
) => React.ReactElement;

function I({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Tab：今日 */
export const SunIcon: IconComponent = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </I>
);

/** Tab：测量（心脉） */
export const HeartPulseIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </I>
);

/** Tab：趋势 */
export const TrendingUpIcon: IconComponent = (p) => (
  <I {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </I>
);

/** Tab：计划 */
export const TargetIcon: IconComponent = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </I>
);

/** Tab：我的 */
export const UserIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </I>
);

/** 快测 */
export const ZapIcon: IconComponent = (p) => (
  <I {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </I>
);

/** 标准测 */
export const ActivityIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </I>
);

/** 深测（体检报告） */
export const FileTextIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v5h5" />
    <path d="M16 13H8M16 17H8M10 9H8" />
  </I>
);

export const MoonIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </I>
);

export const DropletIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />
  </I>
);

/** 连续打卡 streak */
export const FlameIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
  </I>
);

export const SparklesIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" />
    <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
  </I>
);

export const TrophyIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </I>
);

export const ShieldCheckIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
    <path d="m9 12 2 2 4-4" />
  </I>
);

export const InfoIcon: IconComponent = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </I>
);

export const LogOutIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </I>
);

export const CheckIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M20 6 9 17l-5-5" />
  </I>
);

export const PlusIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </I>
);

export const MinusIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M5 12h14" />
  </I>
);

export const ChevronRightIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="m9 18 6-6-6-6" />
  </I>
);

export const ChevronLeftIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="m15 18-6-6 6-6" />
  </I>
);

export const ArrowRightIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </I>
);

export const ArrowLeftIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </I>
);

export const XIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </I>
);

export const CalendarIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </I>
);

/** 体成分 */
export const ScaleIcon: IconComponent = (p) => (
  <I {...p}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </I>
);

/** Logo 时钟 */
export const ClockIcon: IconComponent = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </I>
);
