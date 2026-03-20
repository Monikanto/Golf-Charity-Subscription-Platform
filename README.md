# Golf Charity Subscription Platform

A modern web application where golfers can track scores, enter monthly prize draws, and contribute to charities — all in one beautiful platform.

**Play Golf. Win Prizes. Give Back.**

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3FCF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

---

## Features

### For Golfers (Free Tier)
- View personal dashboard
- Browse supported charities
- Limited score viewing

### Premium Subscribers (9.99/month)
- **Score Tracking** — Enter and track golf scores (1-45)
- **Monthly Prize Draws** — Your latest 5 scores become lottery numbers; match the draw to win!
- **Reward Tiers** — Match 3 (small), 4 (mid-tier), or all 5 (jackpot!)
- **Charity Contributions** — Pick a charity and set a donation percentage
- **Full Score History** — Access your complete scoring history

### Admin Panel
- Run monthly prize draws
- View all user profiles
- Manage winners and draw results

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack) |
| Language     | TypeScript 5                        |
| Styling      | Tailwind CSS 4                      |
| Database     | Supabase (PostgreSQL)               |
| Auth         | Supabase Auth (Email/Password)      |
| Deployment   | Vercel (recommended)                |

---

## Local Setup

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A **Supabase** account ([sign up free](https://supabase.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/Monikanto/Golf-Charity-Subscription-Platform.git
cd Golf-Charity-Subscription-Platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Once the project is ready, go to **Project Settings > API** and copy:
   - **Project URL**
   - **Anon (public) key**

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Set Up the Database

1. In your Supabase Dashboard, go to **SQL Editor**.
2. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.
   - This creates all tables (profiles, scores, draws, winners, charities)
   - Sets up Row Level Security (RLS) policies
   - Seeds sample charities
   - Creates the auto-profile trigger for new signups

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Setting Up an Admin User

1. Sign up for an account through the app.
2. In the Supabase **SQL Editor**, run:

```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

3. Log out and log back in — you'll now have access to the Admin Panel.

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login & Signup pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── admin/            # Admin dashboard (draw management)
│   │   ├── dashboard/        # User dashboard
│   │   │   ├── scores/       # Score tracking
│   │   │   ├── draws/        # Draw results & history
│   │   │   ├── charity/      # Charity selection & contribution
│   │   │   └── subscribe/    # Subscription management
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles & design system
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   └── lib/
│       └── supabase/         # Supabase client utilities
├── supabase/
│   ├── schema.sql            # Database schema & RLS policies
│   └── fix_rls_recursion.sql # RLS recursion fix migration
├── .env.local                # Environment variables (not committed)
└── package.json
```

---

## Available Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start development server       |
| `npm run build` | Build for production            |
| `npm run start` | Start production server         |
| `npm run lint`  | Run ESLint                      |

---

## Database Schema

| Table        | Purpose                                      |
| ------------ | --------------------------------------------- |
| `profiles`   | User profiles with subscription & charity info |
| `scores`     | Golf scores (1-45) per user                    |
| `draws`      | Monthly draw results (5 random numbers)        |
| `winners`    | Draw winners with match count & reward tier    |
| `charities`  | Charity organizations for donations            |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is for educational/assignment purposes.
