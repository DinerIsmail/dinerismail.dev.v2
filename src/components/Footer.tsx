export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col items-start pb-8 gap-8">
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
      <hr className="w-full border-border" />
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between w-full gap-4">
        <p className="text-sm text-muted-foreground">
          © <time>{currentYear}</time> Diner Ismail
        </p>
      </div>
    </footer>
  );
}

