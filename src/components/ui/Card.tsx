import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article';
  padded?: boolean;
  interactive?: boolean;
}

export function Card({ as: Tag = 'section', padded = true, interactive = false, className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-card border border-line bg-surface shadow-card',
        padded && 'p-5',
        interactive && 'transition-shadow duration-150 hover:shadow-card-hover',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Heading id for aria-labelledby on the parent section. */
  id?: string;
}

export function CardHeader({ title, description, icon, actions, className, id }: CardHeaderProps) {
  return (
    <div className={cn('mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        {icon && <span className="mt-0.5 text-ink-muted [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
        <div className="min-w-0">
          <h3 id={id} className="text-[15px] font-semibold leading-6 tracking-tight text-ink">
            {title}
          </h3>
          {description && <p className="mt-0.5 text-[13px] leading-5 text-ink-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
