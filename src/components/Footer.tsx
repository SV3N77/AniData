const footerLinks = [
  {
    title: "Database",
    links: ["Anime", "Manga", "Characters", "Studios", "Staff", "Genres"],
  },
  {
    title: "Discover",
    links: ["Top Anime", "Seasonal", "Upcoming", "Reviews", "Recommendations"],
  },
  {
    title: "Community",
    links: ["Forums", "Lists", "Clubs", "Rankings", "Contributors"],
  },
  {
    title: "About",
    links: ["About", "API Docs", "Data Policy", "Contact", "Blog"],
  },
];


export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-1 to-brand-2 text-sm font-black text-white">
                A
              </div>
              <span className="text-lg font-bold text-foreground">
                Ani<span className="text-accent">Data</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
              Your ultimate destination for discovering, tracking, and celebrating
              anime from every era and genre.
            </p>

          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-accent"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-subtle">
            &copy; {new Date().getFullYear()} AniData. All rights reserved.
          </p>
          <p className="text-sm text-subtle">Made with passion for anime fans.</p>
        </div>
      </div>
    </footer>
  );
}
