import { ArrowUpRight } from 'lucide-react'
import HeroPlay from './HeroPlay'

type SocialLink = {
  href: string
  label: string
  color?: string
}

const socialLinks: SocialLink[] = [
  {
    href: '', // TODO: Add your GitHub profile URL
    label: 'GitHub',
  },
  {
    href: '', // TODO: Add your Twitter/X profile URL
    label: 'Twitter',
    color: 'twitter',
  },
]

export default function Hero() {
  return (
    <section className="w-full flex flex-col-reverse md:flex-row items-center gap-12">
      <div className="flex flex-col items-start w-full gap-3">
        <div className="flex w-full flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Hi, I&apos;m Diner.
          </h1>
          <HeroPlay />
        </div>
        <p className="text-base md:text-lg leading-relaxed md:leading-[1.75] text-balance">
          I&apos;m a software engineer and community tech creator building products
          that make the world a better place. I work at{' '}
          <a
            href="https://olioex.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-primary"
          >
            Olio
          </a>{' '}
          as a <strong>Senior Software Engineer</strong>, and I&apos;m a{' '}
          <strong>co-founder and developer</strong> of{' '}
          <a
            href="https://resilienceweb.org.uk"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-primary"
          >
            Resilience Web
          </a>
          .
        </p>
        <div className="flex flex-row gap-3">
          {socialLinks.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors"
            >
              {label}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <div className="relative flex justify-center pb-4">
        <figure className="shrink-0 w-56 h-56 aspect-square">
          <div className="overflow-hidden rounded-full">
            <img
              alt="A photo of Diner Ismail"
              src="/assets/images/diner.jpg"
              width={224}
              height={224}
              className="w-full h-full object-cover"
            />
          </div>
        </figure>
      </div>
    </section>
  )
}


