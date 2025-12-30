import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between w-full mt-4 mb-16 py-3 bg-background transition-colors duration-200"
    >
      <div className="flex items-center justify-between w-full max-w-3xl mx-auto px-4 lg:px-0 flex-wrap sm:flex-nowrap">
        <h2 className="text-xl mb-2 sm:mb-0">
          <Link
            to="/"
            className="header-link text-2xl hover:opacity-80 transition-opacity"
          >
            Diner Ismail
          </Link>
        </h2>
        <div className="flex flex-row gap-8">
          <Link
            to={"/blog" as any}
            className="header-link text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            Blog
          </Link>
          <Link
            to={"/bookmarks" as any}
            className="header-link text-2xl font-bold hover:opacity-80 transition-opacity"
          >
            Bookmarks
          </Link>
        </div>
      </div>
    </nav>
  )
}
