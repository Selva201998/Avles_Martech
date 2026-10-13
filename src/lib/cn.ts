import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Compose Tailwind class names; later classes win on conflicts. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
