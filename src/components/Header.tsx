import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <nav className="mb-16 flex w-full items-center justify-between py-3">
      <h2 className="text-xl">
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
        {/*<Link
          to="/now"
          className="header-link hover:text-accent text-2xl font-bold transition-colors"
        >
          Now
        </Link>*/}
      </div>
    </nav>
  )
}
