import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <nav
      className="top-0 flex items-center justify-between w-full mb-16 py-3 bg-background duration-200"
    >
      <div className="flex items-center justify-between w-full max-w-3xl mx-auto px-4 lg:px-0 flex-wrap sm:flex-nowrap">
        <h2 className="text-xl mb-2 sm:mb-0">
          <Link
            to="/"
            className="header-link text-2xl hover:text-accent transition-colors"
          >
            Diner Ismail
          </Link>
        </h2>
        <div className="flex flex-row items-center gap-4">
          <Link
            to={"/blog"}
            className="header-link text-2xl font-bold hover:text-accent transition-colors"
          >
            Blog
          </Link>
          {/* <Link
            to={"/bookmarks" as any}
            className="header-link text-2xl font-bold hover:text-accent transition-colors"
          >
            Bookmarks
          </Link> */}
        </div>
      </div>
    </nav>
  )
}
