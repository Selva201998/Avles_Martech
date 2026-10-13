import type { ReactNode } from 'react';
import { SampleDataTag } from './Badge';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
  /** Show the illustrative-data marker under the title (default true). */
  sample?: boolean;
}

export function PageHeader({ title, description, actions, sample = true }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-8 tracking-tight text-ink sm:text-2xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p>
        {sample && <SampleDataTag className="mt-2" label="Illustrative metrics · sample data" />}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-nowrap">{actions}</div>}
    </div>
  );
}
