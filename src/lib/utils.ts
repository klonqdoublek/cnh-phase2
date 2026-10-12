import { clsx, type ClassValue } from "clsx"

/* `cn` used to be twMerge(clsx(...)).
 *
 * tailwind-merge exists to resolve two conflicting Tailwind utilities by
 * deleting the loser from the string. After the port the classes here are
 * .webds-* — names tailwind-merge does not recognise and will not remove — so
 * it had nothing left to do on shipped components, while still being a
 * Tailwind dependency inside every file the registry hands a consumer.
 *
 * Conflicts are now decided by the cascade instead; see the layer order
 * declared at the top of src/index.css. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
