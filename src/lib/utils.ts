import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { allPosts } from 'content-collections'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export const sortedPosts = allPosts.sort(
//   (a, b) =>
//     new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
// );

export type Posts = typeof allPosts
