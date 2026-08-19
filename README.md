<div align="center" id="readme-top">
  <a href="https://github.com/your-username/sleeping-dragons">
    <img src="banner.webp" alt="Sleeping Dragons" width="200" height="130">
  </a>

<h3 align="center">Sleeping Dragons</h3>

  <p align="center">
    A full-featured Free Company website for the Final Fantasy XIV FC Sleeping Dragons on EU · Light · Phoenix. Includes event management with Discord integration, member profiles, RSVP tracking, and an admin panel for officers and leaders.
    <br />
    <br />
    <a href="https://sleeping-dragons.vercel.app/">View Site</a>
    ·
    <a href="https://github.com/your-username/sleeping-dragons/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/your-username/sleeping-dragons/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#deployment">Deployment</a>
      <ul>
        <li><a href="#webapp">Web App (Vercel)</a></li>
        <li><a href="#bot">Discord Bot (Fly.io)</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
<h2 id="about-the-project">📡 About The Project</h2>

![Sleeping Dragons Screenshot](public/screenshot.png)

A website for the Sleeping Dragons Free Company in Final Fantasy XIV. Members can view and RSVP to events directly from the site or via Discord buttons, browse member profiles, and apply to join the FC. Officers and leaders manage everything through a built-in admin panel — creating events, managing member roles, editing profiles, and configuring site-wide settings.

A Discord bot runs alongside the site, posting event embeds with interactive RSVP buttons and keeping them updated in real time as members respond.


### Built With

![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue)
![Discord.js](https://img.shields.io/badge/discord.js-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Fly.io](https://img.shields.io/badge/Fly.io-7c3aed?style=for-the-badge&logo=flydotio&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![UploadThing](https://img.shields.io/badge/UploadThing-e11d48?style=for-the-badge)

<p align="right">[<a href="#readme-top">back to top</a>]</p>



<!-- GETTING STARTED -->
<h2 id="getting-started">📋 Getting Started</h2>

Follow these steps to get a local copy up and running.

<h3 id="prerequisites">Prerequisites</h3>

- Node.js 20+
- npm
  ```sh
  npm install npm@latest -g
  ```
- A PostgreSQL database (local or hosted — [Neon](https://neon.tech) has a free tier)
- A Discord application with OAuth2 enabled ([discord.com/developers](https://discord.com/developers/applications))
- An [UploadThing](https://uploadthing.com) account for image uploads

<h3 id="installation">Installation</h3>

1. Clone the repo
   ```sh
   git clone https://github.com/your-username/sleeping-dragons.git
   cd sleeping-dragons
   ```

2. Install dependencies for the web app
   ```sh
   npm install
   ```

3. Install dependencies for the bot
   ```sh
   cd bot && npm install && cd ..
   ```

4. Copy the environment example and fill in your values
   ```sh
   cp .env.example .env
   ```

   Key variables to set:
   ```sh
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=          # openssl rand -base64 32
   DISCORD_ID=               # Discord OAuth client ID
   DISCORD_SECRET=           # Discord OAuth client secret
   BOT_SECRET=               # shared secret between app and bot
   BOT_URL=http://localhost:3001
   UPLOADTHING_TOKEN=        # from UploadThing dashboard
   ```

5. Copy the bot environment example
   ```sh
   cp bot/.env.example bot/.env
   ```

   ```sh
   DISCORD_BOT_TOKEN=        # from Discord developer portal
   BOT_SECRET=               # must match the app's BOT_SECRET
   FRONTEND_URL=http://localhost:3000
   PORT=3001
   ```

6. Set up the database
   ```sh
   npx prisma migrate dev
   ```

7. Set your Discord OAuth redirect URI in the Discord developer portal
   ```
   http://localhost:3000/api/auth/callback/discord
   ```

<p align="right">[<a href="#readme-top">back to top</a>]</p>



<!-- USAGE -->
<h2 id="usage">💠 Usage</h2>

**Run the web app in development mode:**
```sh
npm run dev
```

**Run the Discord bot in development mode:**
```sh
cd bot && npm run dev
```

Both need to be running locally for the full event → Discord flow to work.

**Seed your first leader account:**  
Sign in with Discord, then use Prisma Studio to set your user's `role` to `LEADER`:
```sh
npx prisma studio
```

From there, the admin panel at `/admin` gives you full control over the site.

<p align="right">[<a href="#readme-top">back to top</a>]</p>



<!-- FEATURES -->
<h2 id="features">✨ Features</h2>

**Events**
- Create, edit, publish, cancel, and delete events
- Reusable event templates for recurring content
- RSVP from the website or via Discord buttons
- Event embeds auto-update in Discord as members respond
- Past events archive with infinite scroll

**Members & Profiles**
- Member grid with portrait, job, playstyle, and activity tags
- Officer-created profiles with UploadThing image uploads
- Profile editing restricted to the owner or a leader

**Admin Panel** (`/admin` — officers and leaders only)
- Member management: view all users, set roles, track Discord link and profile status
- Event templates: create and edit reusable templates
- Site settings: FC name, subtitle, welcome text, Discord invite link, event channel ID

**Discord Bot**
- Posts event embeds with ✅ / ❓ / ❌ RSVP buttons on publish
- Buttons automatically disabled after the event starts
- Attendance counts update live on both the embed and the website

**Auth**
- Discord OAuth via Auth.js
- Role system: Guest → Member → Officer → Leader

<p align="right">[<a href="#readme-top">back to top</a>]</p>



<!-- DEPLOYMENT -->
<h2 id="deployment">🚀 Deployment</h2>

<h3 id="webapp">Web App — Vercel</h3>

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
   - Framework Preset: **Next.js**
   - Root Directory: leave blank (repo root)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Add `"postinstall": "prisma generate"` to the root `package.json` scripts so Prisma generates the client on every build
5. Run migrations against your production database before the first deploy:
   ```sh
   DATABASE_URL=your_production_url npx prisma migrate deploy
   ```
6. Add your production URL to Discord OAuth redirect URIs:
   ```
   https://yourdomain.vercel.app/api/auth/callback/discord
   ```
7. Add a `.vercelignore` at the repo root to exclude the bot:
   ```
   bot/
   ```

<h3 id="bot">Discord Bot — Fly.io</h3>

1. Install flyctl and log in
   ```sh
   curl -L https://fly.io/install.sh | sh
   fly auth login
   ```
2. Create the app
   ```sh
   cd bot
   fly launch --no-deploy
   ```
3. Set secrets
   ```sh
   fly secrets set \
     DISCORD_BOT_TOKEN=your_token \
     BOT_SECRET=your_shared_secret \
     FRONTEND_URL=https://yourdomain.vercel.app \
     PORT=3001
   ```
4. Deploy
   ```sh
   fly deploy
   ```
5. Update `BOT_URL` in your Vercel environment variables to the Fly app URL, then redeploy.

> **Note:** The bot must stay running at all times to receive Discord interactions. The `fly.toml` is configured with `auto_stop_machines = false` and `min_machines_running = 1` to ensure this.

<p align="right">[<a href="#readme-top">back to top</a>]</p>



<!-- LICENSE -->
<h2 id="license">🔒 License</h2>

Distributed under the MIT License. See `LICENSE.txt` for more information.



<!-- CONTACT -->
<h2 id="contact">📧 Contact</h2>

<p align="right">[<a href="#readme-top">back to top</a>]</p>
