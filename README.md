[README.md](https://github.com/user-attachments/files/29163917/README.md)
# IRON BOND 🇮🇱

**A preparation platform for Jewish youth in North America enlisting in the IDF.**

🌐 **Live App:** [iron-bond.vercel.app](https://iron-bond.vercel.app)

---

## What is Iron Bond?

Iron Bond is a full-stack web application that helps Jewish young adults in North America prepare for IDF enlistment. It combines daily combat fitness training, Israeli heritage education, team communities, and step-by-step enlistment guidance — all in one place.

---

## The Problem

Jewish youth from North America who choose to enlist in the IDF ("Lone Soldiers") face a unique challenge: they are preparing for military service while living thousands of miles away from Israel, often without a support system that understands the process.

They struggle with:
- **Physical preparation** — no structured IDF-style training programs
- **Bureaucratic confusion** — the enlistment process (Giyus) is complex and in Hebrew
- **Isolation** — no community of peers going through the same experience
- **Cultural disconnect** — limited connection to Israeli identity and values

---

## Target Audience

Jewish young adults (ages 17–25) in North America who are planning or considering enlisting in the IDF as Lone Soldiers.

---

## Competitors & Differentiation

| Competitor | What they offer | Our advantage |
|-----------|----------------|---------------|
| Nefesh B'Nefesh | Aliyah guidance | We focus on pre-enlistment prep, not just immigration |
| Generic fitness apps | Workout tracking | We offer IDF-specific combat training programs |
| WhatsApp groups | Community chat | We combine training + community + Giyus guidance in one platform |
| Personal research | None | We centralize all Lone Soldier information in one structured roadmap |

Iron Bond is the **only platform** that combines physical training, heritage education, community, and enlistment guidance specifically for Lone Soldiers in North America.

---

## Screenshots

### Landing Page
![Landing Page](https://iron-bond.vercel.app)

### Dashboard
> Sign up at iron-bond.vercel.app to see the full member experience.

---

## Features

- 🏋️ **Daily Workout** — IDF-inspired combat fitness programs with progress tracking
- 🎥 **Values Library** — Israeli heritage and IDF values video content
- 💬 **Team Hub** — Real-time chat with your local city team
- 📋 **Giyus Center** — Step-by-step enlistment roadmap with document downloads
- ⛺ **Summer Camp** — Registration for immersive training camps
- 👤 **Profile & Leaderboard** — Personal stats and city rankings

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Create React App), React Router DOM |
| Styling | CSS Variables, Google Fonts (Bebas Neue + DM Sans) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel |
| Analytics | Microsoft Clarity |
| Feedback | Tally Forms |

---

## External Services & Integrations

| Service | Type | Purpose |
|---------|------|---------|
| Supabase | Backend + Auth | Database, user authentication, Row Level Security |
| Vercel | Hosting / CDN | Frontend deployment and global delivery |
| Microsoft Clarity | Analytics | Session recording and heatmaps |
| Tally | Feedback | In-app user feedback form |

---

## Data Model (ERD)

The app uses a PostgreSQL database on Supabase with the following entities:

`profiles` · `workouts` · `exercises` · `videos` · `teams` · `messages` · `user_teams` · `giyus_steps` · `camps` · `registrations` · `payments`

Full ERD available in: [`iron_bond_erd.html`](./iron_bond_erd.html)

---

## Getting Started (Local Development)

```bash
git clone https://github.com/Victor-Zank/iron-bond.git
cd iron-bond
npm install
```

Create a `.env` file in the root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npm start
```

App runs on `http://localhost:3000`

---

## Demo User

To test the app without registering:
- **Email:** vikzank@gmail.com
- **Password:** contact the developer

Or register a new account at [iron-bond.vercel.app/register](https://iron-bond.vercel.app/register)

---

## Running Tests

```bash
npm run test:ui
```

Requires `SUPABASE_SERVICE_KEY` in `.env`.

---

## Developer

**Victor Zank** — Full-Stack Developer  
Ono Academic College — Web Development Course  
GitHub: [@Victor-Zank](https://github.com/Victor-Zank)
