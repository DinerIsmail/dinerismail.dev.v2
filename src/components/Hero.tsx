import { FaGithub, FaGoodreads, FaLinkedin } from 'react-icons/fa'
import HeroPlay from './HeroPlay'

type SocialLink = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const socialLinks: SocialLink[] = [
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

export default function Hero() {
  return (
    <section className="flex w-full flex-col-reverse items-center gap-12 md:flex-row">
      <div className="flex w-full flex-col items-start gap-3">
        <div className="flex w-full flex-col items-center justify-center gap-3 md:flex-row md:items-center md:justify-start">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Hi, I&apos;m Diner.
          </h1>
          <HeroPlay />
        </div>
        <p className="text-base leading-relaxed text-balance md:text-lg md:leading-[1.75]">
          I&apos;m a software engineer and community tech creator building
          products that make the world a better place. I work at{' '}
          <a
            href="https://olioex.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary underline underline-offset-4"
          >
            Olio
          </a>{' '}
          as a <strong>Senior Software Engineer</strong>, and I&apos;m a{' '}
          <strong>co-founder and developer</strong> of{' '}
          <a
            href="https://resilienceweb.org.uk"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary underline underline-offset-4"
          >
            Resilience Web
          </a>
          .
        </p>
        <div className="mt-2 flex flex-row gap-4">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="hover:text-accent text-white transition-colors duration-200"
            >
              <Icon className="h-6 w-6" />
            </a>
          ))}
        </div>
      </div>
      <div className="relative flex justify-center pb-4">
        <figure className="aspect-square h-56 w-56 shrink-0">
          <div className="overflow-hidden rounded-full">
            <img
              alt="A photo of Diner Ismail"
              src="/assets/images/diner.png"
              width={224}
              height={224}
              className="h-full w-full object-cover"
            />
          </div>
        </figure>
      </div>
    </section>
  )
}
