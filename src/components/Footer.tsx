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
    <footer className="border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 text-sm font-black text-white">
                A
              </div>
              <span className="text-lg font-bold text-white">
                Ani<span className="text-rose-400">Data</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-400">
              Your ultimate destination for discovering, tracking, and celebrating
              anime from every era and genre.
            </p>
           
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-zinc-400 transition-colors hover:text-rose-400"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} AniData. All rights reserved.
          </p>
          <p className="text-sm text-zinc-500">Made with passion for anime fans.</p>
        </div>
      </div>
    </footer>
  );
}
