import { Link } from '@tanstack/react-router'

const navItems = [
  { to: '/articles', label: 'Articles' },
  { to: '/books', label: 'Books' },
  { to: '/links', label: 'Links' },
  // { to: '/now', label: 'Now' },
] as const

export default function Header() {
  return (
    <nav className="mb-16 flex w-full flex-col items-start gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <h2 className="text-xl">
        <Link
          to="/"
          className="header-link hover:text-accent text-2xl whitespace-nowrap transition-colors"
        >
          Diner Ismail
        </Link>
      </h2>
      <div className="flex flex-row flex-wrap items-center gap-x-6 gap-y-1">
        {navItems.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="header-link hover:text-accent data-[status=active]:text-accent text-2xl font-bold transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
