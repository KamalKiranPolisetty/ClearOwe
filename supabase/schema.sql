-- ==========================================================
-- ClearOwe Production Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    primary_currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Loans Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lender_name TEXT NOT NULL,
    lender_type TEXT NOT NULL DEFAULT 'bank' CHECK (lender_type IN ('bank', 'private_lender', 'relative', 'friend', 'other')),
    lender_phone TEXT,
    currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('USD', 'INR')),
    original_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (original_amount >= 0),
    remaining_principal NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (remaining_principal >= 0),
    interest_type TEXT NOT NULL DEFAULT 'percentage_monthly' CHECK (interest_type IN ('percentage_monthly', 'percentage_yearly', 'fixed_monthly', 'no_interest')),
    interest_rate NUMERIC(10, 4) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    interest_due_day INTEGER NOT NULL DEFAULT 1 CHECK (interest_due_day >= 1 AND interest_due_day <= 31),
    overdue_rule TEXT NOT NULL DEFAULT 'carry_forward' CHECK (overdue_rule IN ('carry_forward', 'compound')),
    priority TEXT NOT NULL DEFAULT 'high' CHECK (priority IN ('top', 'high', 'medium', 'low')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    reminder_days_before INTEGER NOT NULL DEFAULT 3,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    destination TEXT NOT NULL DEFAULT 'split' CHECK (destination IN ('interest', 'principal', 'split')),
    interest_portion NUMERIC(15, 2) NOT NULL DEFAULT 0,
    principal_portion NUMERIC(15, 2) NOT NULL DEFAULT 0,
    overdue_portion NUMERIC(15, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    receipt_url TEXT,
    running_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_by TEXT DEFAULT 'You',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON public.loans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON public.payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date DESC);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Direct user data ownership
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Loans RLS
DROP POLICY IF EXISTS "Users can view own loans" ON public.loans;
CREATE POLICY "Users can view own loans"
    ON public.loans FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own loans" ON public.loans;
CREATE POLICY "Users can insert own loans"
    ON public.loans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own loans" ON public.loans;
CREATE POLICY "Users can update own loans"
    ON public.loans FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own loans" ON public.loans;
CREATE POLICY "Users can delete own loans"
    ON public.loans FOR DELETE
    USING (auth.uid() = user_id);

-- Payments RLS
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
CREATE POLICY "Users can update own payments"
    ON public.payments FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;
CREATE POLICY "Users can delete own payments"
    ON public.payments FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Auto-create Profile Trigger upon User Sign-Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Storage bucket for optional payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('loan-receipts', 'loan-receipts', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload receipt photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload receipt photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'loan-receipts' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Receipt photos are publicly accessible" ON storage.objects;
CREATE POLICY "Receipt photos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'loan-receipts');
