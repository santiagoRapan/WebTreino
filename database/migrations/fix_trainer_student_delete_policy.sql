-- Fix missing DELETE policy for trainer_student table
-- This allows trainers to delete their student relationships

-- Add DELETE policy for trainers to remove students from their roster
CREATE POLICY "entrenador puede eliminar de su roster" ON trainer_student
    FOR DELETE USING (trainer_id = auth.uid());

-- Add DELETE policy for students to remove themselves from trainer rosters
CREATE POLICY "alumno puede desvincularse de entrenador" ON trainer_student
    FOR DELETE USING (student_id = auth.uid());

-- Optional: Add UPDATE policy if needed for future features
-- CREATE POLICY "entrenador puede actualizar su roster" ON trainer_student
--     FOR UPDATE USING (trainer_id = auth.uid())
--     WITH CHECK (trainer_id = auth.uid());

-- Optional: Add INSERT policy if needed for manual roster management
-- CREATE POLICY "entrenador puede agregar a su roster" ON trainer_student
--     FOR INSERT WITH CHECK (trainer_id = auth.uid());
