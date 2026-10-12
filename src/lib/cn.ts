import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/* App-side class merge. `@/lib/utils` is an installed webds file and, since
 * the v0.18 plain-CSS port, its `cn` is `clsx` alone — webds' own classes are
 * `.webds-*` and need no merging. Authored screens still write Tailwind, so
 * they keep `twMerge` here instead of editing the installed file. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
