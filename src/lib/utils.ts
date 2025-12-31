import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { allPosts } from 'content-collections'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const sortedPosts = allPosts.sort(
  (a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime(),
);

export const lastFivePosts = sortedPosts.slice(0, 4)

export type Posts = typeof allPosts
