import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'success' | 'info' | 'warning';
}

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  info: <Info className="h-4 w-4 text-brand-600" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-600" />,
};

export function ToastViewport({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: number) => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'animate-fade-in pointer-events-auto flex items-start gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 text-[13px] text-ink shadow-popover',
          )}
        >
          <span className="mt-0.5">{ICONS[toast.tone]}</span>
          <span className="flex-1 leading-5">{toast.text}</span>
          <button onClick={() => onDismiss(toast.id)} className="text-ink-faint hover:text-ink" aria-label="Dismiss notification">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
