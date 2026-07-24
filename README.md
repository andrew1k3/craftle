# Craftle

Craftle is a daily game inspired by the game loop of "Wordle" where players guess the MineCraft item of the day, with a randomized inventory of items.
Players will get feedback on their guesses about the positioning and choices of their crafting elements for up to 5 attempts.
Everyday, a new random item will be chosen as the one to be guessed, and a new randomized inventory is picked. This inventory is a combination of the elements comprising random recipes so it isn't just insane items altogether.

# Web routes

- / (main site, game screen)
- /login (optional page upon popup for first visit to sign up for leaderboard)
- /admin (admin panel only i can access through my login to see stats and change the current recipe, etc.)

# File system for mono repo

- apps/web: craftle app
- apps/docs: ex
- apps/home: portfolio (link to others)
- packages/ui: put shared ui
- apps/??: api layer sit?

# Database

- Repository of all minecraft items with crafting recipes needed
- Daily game data, updated every night 00.00 AEST
- Users/user data from completion attempts.
- Logs of these users
  > Drawing of this database structure needed

# API endpoints

We will need API routes for accessing data from our databases + updating.

Some examples include:

- GET today's game state, (inventory, don't post the actual correct answer)
- POST guess (for log, auth from same session, attempt #) and then get evaluation + game state

# UI/UX user stories

I want it to be smooth and clean.

I want the ability to use minecraft's built in quick drag of items.

I don't want the site to glitch out and highlight randomly, should be a functional game window.

# stack

- turborepo (monorepo)
- nextjs (framework)
- tailwindcss (styling)
- shadcn (ui component library)
- git (version control)
- github actions (CI/CD)
- ?? (postgres hosted database)
- ?? (api layer framework like fastapi for py but for ts)
- vercel (free deployment)
- docker (container for deployment and CD)
- ?? (testing library)
- ?? (adapter interface library with database, sql substitute if i didn't want to use stored procs)
- ?? (framework to make models easily with postgres and ts)
- better-auth (lightweight optional login system)
- ?? (hosted cron job to run script for new daily task)
