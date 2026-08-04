# SirSheba

A modern education-management dashboard for handling learners, fees, activity, communication, and administrative workflows from one responsive application.

## Features

- Dashboard statistics and quick actions
- Pending-fee alerts and recent activity
- Authentication and protected application areas
- Data-backed forms and validation
- Email workflow support
- Responsive admin interface

## Tech stack

- Next.js 16
- React 19 and TypeScript
- Tailwind CSS 4
- Radix UI
- Supabase
- Resend
- Zustand
- Vercel Analytics

## Run locally

```bash
git clone https://github.com/naziulsiam/sirsheba.git
cd sirsheba
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Connected features require environment variables for services such as Supabase and Resend. Copy the project’s example environment file if present, keep local secrets outside Git, and configure the same variables in the deployment platform.

## Commands

```bash
npm run dev
npm run build
npm start
npm run lint
```
