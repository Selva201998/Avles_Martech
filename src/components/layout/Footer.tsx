import { BRAND } from '../../config/brand';
import { useApp } from '../../app/appContext';

export function Footer() {
  const { openAbout } = useApp();
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-1.5 px-4 py-4 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>
          <span className="font-medium text-ink-secondary">{BRAND.productName}</span> · {BRAND.tagline}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-orange" aria-hidden />
            {BRAND.sampleDataNotice}
          </span>
          <span aria-hidden>·</span>
          <button onClick={openAbout} className="font-medium text-brand-700 hover:underline">
            About this demo
          </button>
        </span>
      </div>
    </footer>
  );
}
