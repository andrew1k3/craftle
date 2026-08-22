[![ci](https://github.com/andrew1k3/craftle/actions/workflows/main.yml/badge.svg?branch=main&event=push)](https://github.com/andrew1k3/craftle/actions/workflows/main.yml)
![Website Deploy](https://deploy-badge.vercel.app/vercel/deploy-badge?url=https://craftle-ten.vercel.app/?logo=vercel)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)



# craftle

craftle is a daily game inspired by the game loop of "Wordle" where players guess the Minecraft item of the day, with a randomized inventory of items.
Players will get feedback on their guesses about the positioning and choices of their crafting elements for up to 5 attempts.
Everyday, a new random item will be chosen as the one to be guessed, and a new randomized inventory is picked. This inventory is a combination of the elements comprising random recipes so it isn't just insane items altogether.

# File system 

- apps/web: craftle app
- apps/docs: ex
- apps/home: portfolio (link to others)
- packages/ui: put shared ui
- packages/api: api layer sit
- packages/db: db interaction
- packages/contacts: schema for data (zod)
- packages/auth: better-auth config

# Database

- Daily game data, updated every night 00.00 AEST
- User/Account/Session data from auth.
- Past game items.
- Logs of these users and past game stats (completion rate, guess rate, etc...)

  > Drawing of this database structure needed

# API endpoints

We will need API routes for accessing data from our databases + updating.

Some examples include:

- GET today's game state, (inventory, don't post the actual correct answer)
- POST guess (for log, auth from same session, attempt #) and then get evaluation + game state
- POST game state (for cron job and admin panel, auth'd)
- GET stats (for admin panel, auth'd, paginated)

# Routes
- / (main game)
- /admin (admin portal for me to check statistics, see current answer, change it to choice)

# UI/UX user stories

I want it to be smooth and clean.

I want the ability to use minecraft's built in quick drag of items.

I don't want the site to glitch out and highlight randomly, should be a functional game window.

# Stack

- turborepo (monorepo)
- nextjs (framework)
- tailwindcss (styling)
- shadcn (ui component library)
- git (version control)
- github actions (CI/CD)
- neon (postgres hosted database)
- hono (api layer framework like fastapi for py but for ts) https://hono.dev/examples/zod-openapi 
- vercel (free deployment)
- vitest (testing library)
- drizzleORM (adapter interface library with database, sql substitute if i didn't want to use stored procs)
- zod (framework to make models easily with postgres and ts)
- better-auth (lightweight optional login system)
- gh actions (hosted cron job to run script for new daily task)
- minecraft-data (nodejs indexer for the minecraft-data npm package)
