
# Workflow Rules

- **Do NOT run `eslint`, `lint`, `build`, or `typecheck` automatically after every prompt.** Only run them when explicitly asked.
- Do not commit changes unless explicitly requested.

# AniData

A web application built with Next.js (App Router).

## Technologies

- **Framework:** Next.js 16.2.12 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **UI:** React 19.2.4, Tailwind CSS 4 (via PostCSS)
- **Package Manager:** Yarn 4.17.1 (node-modules linker)
- **Linting:** ESLint 9 with `eslint-config-next` (core-web-vitals + TypeScript)

## Scripts

| Script         | Command     |
| -------------- | ----------- |
| `yarn dev`     | `next dev`  |
| `yarn build`   | `next build`|
| `yarn start`   | `next start`|
| `yarn lint`    | `eslint`    |

## Project Structure

```
AniData/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── favicon.ico
│   │   ├── globals.css      # Global styles (Tailwind import)
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── RankedTable.tsx
│   │   ├── ScheduleSection.tsx
│   │   ├── SearchHero.tsx
│   │   ├── SeasonalSection.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   └── lib/
│       ├── anilist.ts       # AniList API client
│       ├── fetchers.ts      # Data fetching helpers
│       └── types.ts         # Shared TypeScript types
├── .vscode/
│   └── settings.json
├── .yarn/                   # Yarn cache & install state
├── .yarnrc.yml              # Yarn config (nodeLinker: node-modules)
├── eslint.config.mjs        # Flat ESLint config
├── next.config.ts           # Next.js config
├── postcss.config.mjs       # PostCSS (Tailwind plugin)
├── tsconfig.json            # TypeScript config (`@/*` -> `./src/*`)
└── package.json
```

### Path Aliases

- `@/*` maps to `./src/*`
