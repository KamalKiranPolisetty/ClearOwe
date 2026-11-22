-- ==========================================================
-- ClearOwe: Insert 18 Zero-Interest Loans for kamalkiran898@gmail.com
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/enuhjqvghcbulfgextun/sql/new
-- ==========================================================

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 1. Find user_id from auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE LOWER(email) = 'kamalkiran898@gmail.com';

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User kamalkiran898@gmail.com not found in auth.users yet. Please sign up or log in first at http://localhost:3000 with kamalkiran898@gmail.com, then run this SQL script again!';
        RETURN;
    END IF;

    -- 2. Insert the 18 loans (0% interest, no due date obligation)
    INSERT INTO public.loans (
        user_id,
        lender_name,
        lender_type,
        currency,
        original_amount,
        remaining_principal,
        interest_type,
        interest_rate,
        interest_due_day,
        start_date,
        overdue_rule,
        priority,
        is_pinned,
        is_archived
    ) VALUES
        (v_user_id, 'Ramu', 'friend', 'INR', 200000, 200000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'high', false, false),
        (v_user_id, 'Gupta', 'friend', 'INR', 50000, 50000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'medium', false, false),
        (v_user_id, 'Krishna', 'friend', 'INR', 100000, 100000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'high', false, false),
        (v_user_id, 'Namana', 'friend', 'INR', 50000, 50000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'medium', false, false),
        (v_user_id, 'Balaji', 'friend', 'INR', 200000, 200000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'high', false, false),
        (v_user_id, 'Yesu Raju', 'friend', 'INR', 100000, 100000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'high', false, false),
        (v_user_id, 'KVN', 'friend', 'INR', 50000, 50000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'medium', false, false),
        (v_user_id, 'Vishal', 'friend', 'INR', 50000, 50000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'medium', false, false),
        (v_user_id, 'Gold Loan 1', 'bank', 'INR', 200000, 200000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'top', false, false),
        (v_user_id, 'Gold Loan 2', 'bank', 'INR', 200000, 200000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'top', false, false),
        (v_user_id, 'Gold Loan 3', 'bank', 'INR', 200000, 200000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'top', false, false),
        (v_user_id, 'Deepthi', 'relative', 'INR', 100000, 100000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'high', false, false),
        (v_user_id, 'Nani', 'friend', 'INR', 100000, 100000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'high', false, false),
        (v_user_id, 'Chitturi', 'friend', 'INR', 100000, 100000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'high', false, false),
        (v_user_id, 'AE', 'other', 'INR', 100000, 100000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'high', false, false),
        (v_user_id, 'Sasi', 'friend', 'INR', 100000, 100000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'high', false, false),
        (v_user_id, 'Bangarraju', 'friend', 'INR', 50000, 50000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'medium', false, false),
        (v_user_id, 'Raghava', 'friend', 'INR', 50000, 50000, 'no_interest', 0, 1, CURRENT_DATE, 'carry_forward', 'medium', false, false);

    RAISE NOTICE 'Successfully added all 18 loans (Total: ₹20,00,000) for %', 'kamalkiran898@gmail.com';
END $$;
