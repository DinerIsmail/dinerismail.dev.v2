import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <nav className="bg-background top-0 mb-16 flex w-full items-center justify-between py-3 duration-200">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between px-4 sm:flex-nowrap lg:px-0">
        <h2 className="mb-2 text-xl sm:mb-0">
          <Link
            to="/"
            className="header-link hover:text-accent text-2xl transition-colors"
          >
            Diner Ismail
          </Link>
        </h2>
        <div className="flex flex-row items-center gap-6">
          <Link
            to={'/articles'}
            className="header-link hover:text-accent text-2xl font-bold transition-colors"
          >
            Articles
          </Link>
          <Link
            to="/now"
            className="header-link hover:text-accent text-2xl font-bold transition-colors"
          >
            Now
          </Link>
        </div>
      </div>
    </nav>
  )
}
