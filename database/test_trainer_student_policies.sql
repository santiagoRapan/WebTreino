-- Test script to check trainer_student RLS policies
-- Run this in your Supabase SQL editor to verify the policies exist

-- 1. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'trainer_student';

-- 2. Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'trainer_student'
ORDER BY policyname;

-- 3. Test if we can see trainer_student data (replace with your actual user ID)
-- Replace 'your-user-id-here' with your actual auth.uid()
SELECT 
    id,
    trainer_id,
    student_id,
    joined_at
FROM trainer_student 
WHERE trainer_id = auth.uid() 
   OR student_id = auth.uid();

-- 4. Check if DELETE policies exist specifically
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'trainer_student' 
  AND cmd = 'DELETE';
