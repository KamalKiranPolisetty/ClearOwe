# ClearOwe - Personal Loan & Debt Tracker

ClearOwe is a production-ready, offline-first Progressive Web App (PWA) built for clear, transparent tracking of personal loans, bank borrowings, peer-to-peer debts, and equipment financing.

---

## Key Capabilities

1. **Clean, Modern UI**
   - Streamlined navigation tabs: **Dashboard**, **This Month**, **Loans**, **Settings**.
   - Dual-currency tracking: Independent dashboards for **INR (₹)** and **USD ($)**.
   - Glassmorphism design system matching SimpleSpend with light theme and accessible typography.

2. **Accurate Calculation & Allocation Engine**
   - Interest calculation types:
     - `% Per Month` on remaining principal
     - `% Per Year` on remaining principal
     - `Fixed Monthly Amount`
     - `No Interest` (0% friendly loan)
   - Overdue rules:
     - `Carry forward as overdue` (default)
     - `Add to principal (Compound)`
   - Intelligent payment allocation: Clears overdue first, then current month interest, then reduces principal balance.
   - 100% test coverage using Vitest.

3. **Offline-First Architecture & Cloud Sync**
   - Works 100% offline via local browser storage.
   - Seamless synchronization with **Supabase Postgres** when connected.
   - Built-in guest demo mode with instant sign-in.

4. **Data Privacy & Export**
   - One-click CSV / Excel export of all loans and payment history.
   - Reset local data option for a fresh start.

---

## 1. How to Run Locally

### Prerequisites
- Node.js 18+ (tested on Node v25)
- npm 9+

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Supabase Setup Guide

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**, choose an organization, give it a name (e.g. `clearowe-db`), and set a database password.
3. Select your preferred region.

### Step 2: Run the Database Schema & RLS Policies
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Open the file `supabase/schema.sql` from this repository.
3. Copy the entire script and paste it into the Supabase SQL Editor.
4. Click **Run**. This will create:
   - `profiles` table with automatic user creation trigger
   - `loans` table with Row Level Security (RLS)
   - `payments` table with Row Level Security (RLS)
   - `loan-receipts` public storage bucket
   - Performance indexes on user and date columns

### Step 3: Get API Credentials
1. Go to **Project Settings -> API**.
2. Copy your **Project URL** and **Project API Key (`anon public`)**.
3. Create a `.env.local` file in your project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 3. Deployment on Vercel

### Deploy via Vercel Dashboard
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..." -> "Project"**.
4. Import your repository.
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: (your Supabase URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (your Supabase anon key)
6. Click **Deploy**. Vercel will build and deploy your app with a production URL.
