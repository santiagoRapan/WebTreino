-- Quick fix: Apply missing DELETE policies for trainer_student table
-- Run this directly in your Supabase SQL editor

-- First, check if policies already exist
DO $$
BEGIN
    -- Check if DELETE policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trainer_student' 
        AND cmd = 'DELETE'
    ) THEN
        RAISE NOTICE 'Creating missing DELETE policies for trainer_student...';
        
        -- Create DELETE policy for trainers
        CREATE POLICY "entrenador puede eliminar de su roster" ON trainer_student
            FOR DELETE USING (trainer_id = auth.uid());
            
        -- Create DELETE policy for students  
        CREATE POLICY "alumno puede desvincularse de entrenador" ON trainer_student
            FOR DELETE USING (student_id = auth.uid());
            
        RAISE NOTICE 'DELETE policies created successfully!';
    ELSE
        RAISE NOTICE 'DELETE policies already exist.';
    END IF;
END $$;

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%trainer_id%' THEN 'Trainer policy'
        WHEN qual LIKE '%student_id%' THEN 'Student policy'
        ELSE 'Other'
    END as policy_type
FROM pg_policies 
WHERE tablename = 'trainer_student' 
  AND cmd = 'DELETE'
ORDER BY policyname;
