import { BookOpen, Link2, PenLine } from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  // Shorter label for the mobile header, where horizontal space is tight
  shortLabel?: string
  icon: React.ComponentType<{ className?: string }>
}

export const navItems: NavItem[] = [
  { to: '/articles', label: 'Articles', icon: PenLine },
  { to: '/books', label: 'Book notes', shortLabel: 'Books', icon: BookOpen },
  { to: '/links', label: 'Links', icon: Link2 },
  // { to: '/now', label: 'Now', icon: Clock },
]
