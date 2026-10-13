import { useId } from 'react';
import { BRAND } from '../../config/brand';

/** Avles mark: an open "A" — two rising strokes joined by a lifecycle node. Original artwork. */
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  // Unique gradient id: several logo instances (some display:none) can be on the page at once.
  const gradientId = `avles-logo-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7b63f5" />
          <stop offset="1" stopColor="#4b32c0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <path d="M9.5 23.5 L16 8.5 L22.5 23.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="18.6" r="2.4" fill="#5eead4" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && <span className="text-[16px] font-semibold tracking-tight text-ink">{BRAND.productName}</span>}
    </span>
  );
}
