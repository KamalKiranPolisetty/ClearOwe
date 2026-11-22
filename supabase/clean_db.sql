-- ==========================================================
-- ClearOwe Database Full Reset / Clean-Up Script
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==========================================================

-- 1. Wipe all application data (Payments, Loans, Profiles)
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.loans CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 2. Wipe all authenticated users from Supabase Auth
-- (This removes all previous test accounts, unconfirmed users, and auth sessions)
DELETE FROM auth.users;

-- 3. Verify that all tables are completely empty (all should return 0)
SELECT 
    (SELECT COUNT(*) FROM auth.users) AS remaining_users,
    (SELECT COUNT(*) FROM public.profiles) AS remaining_profiles,
    (SELECT COUNT(*) FROM public.loans) AS remaining_loans,
    (SELECT COUNT(*) FROM public.payments) AS remaining_payments;
