import { FaGithub, FaGoodreads, FaLinkedin } from 'react-icons/fa'

export type SocialLink = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export const socialLinks: SocialLink[] = [
  {
    href: 'https://github.com/DinerIsmail',
    label: 'GitHub',
    icon: FaGithub,
  },
  {
    href: 'https://linkedin.com/in/dinerismail',
    label: 'LinkedIn',
    icon: FaLinkedin,
  },
  {
    href: 'https://www.goodreads.com/dinerismail',
    label: 'Goodreads',
    icon: FaGoodreads,
  },
]
