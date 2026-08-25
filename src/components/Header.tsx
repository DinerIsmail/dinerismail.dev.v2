import { navItems } from '@/lib/nav'
import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <nav className="mb-16 flex w-full flex-col items-start gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:hidden">
      <h2 className="text-xl">
        <Link
          to="/"
          className="header-link hover:text-accent text-2xl whitespace-nowrap transition-colors"
        >
          Diner Ismail
        </Link>
      </h2>
      <div className="flex flex-row flex-wrap items-center gap-x-6 gap-y-1">
        {navItems.map(({ to, label, shortLabel }) => (
          <Link
            key={to}
            to={to}
            className="header-link hover:text-accent data-[status=active]:text-accent text-2xl font-bold transition-colors"
          >
            {shortLabel ?? label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
