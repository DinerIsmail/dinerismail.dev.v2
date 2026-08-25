import { navItems } from '@/lib/nav'
import { socialLinks } from '@/lib/social'
import { Link } from '@tanstack/react-router'

export default function Sidebar() {
  return (
    <aside className="border-border sticky top-0 hidden h-dvh w-72 shrink-0 flex-col gap-7 overflow-y-auto border-r px-7 py-8 lg:flex">
      <Link to="/" className="hover:text-accent transition-colors">
        <h2 className="text-xl">Diner Ismail</h2>
      </Link>

      <ul className="flex flex-col gap-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="hover:text-accent data-[status=active]:text-accent flex items-center gap-3 font-medium transition-colors"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <hr className="border-border" />

      <div className="flex flex-col gap-3">
        <h3 className="text-base">Stay Connected</h3>
        <ul className="flex flex-col gap-3">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-accent flex items-center gap-3 text-sm transition-colors"
              >
                <Icon className="size-4" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
