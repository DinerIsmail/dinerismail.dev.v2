export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-16 flex flex-col items-start gap-8 pb-8">
      <div className="flex flex-row gap-4">
        <a
          href="https://www.codementor.io/@dinerismail?refer=badge"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://www.codementor.io/m-badges/dinerismail/find-me-on-cm-g.svg"
            alt="Codementor badge"
            height="100"
            width="150"
            className="rounded-[10px]"
          />
        </a>
        <a
          href="https://www.buymeacoffee.com/diner"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/assets/buymeacoffee.png"
            alt="Buy me a Coffee"
            height="100"
            width="200"
          />
        </a>
      </div>
      <hr className="border-border w-full" />
      <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        <p className="text-muted-foreground text-sm">
          © <time>{currentYear}</time> Diner Ismail
        </p>
      </div>
    </footer>
  )
}
