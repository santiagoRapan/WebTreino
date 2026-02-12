-- Fix orphan trainer_link_request records and clean up duplicates
-- This script finds requests marked as 'accepted' that don't have a corresponding
-- trainer_student relationship, creates missing relationships, and removes duplicates

-- STEP 1: Remove duplicate trainer_student entries (keep only the oldest one)
DELETE FROM trainer_student
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY trainer_id, student_id 
             ORDER BY joined_at ASC, id ASC
           ) as row_num
    FROM trainer_student
  ) t
  WHERE row_num > 1
);

-- STEP 2: Create missing trainer_student relationships for accepted requests
INSERT INTO trainer_student (trainer_id, student_id, joined_at, status)
SELECT DISTINCT 
  tlr.trainer_id, 
  tlr.student_id,
  COALESCE(tlr.decided_at, tlr.created_at, NOW()) as joined_at,
  'active' as status
FROM trainer_link_request tlr
WHERE tlr.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1 
    FROM trainer_student ts 
    WHERE ts.trainer_id = tlr.trainer_id 
      AND ts.student_id = tlr.student_id
  );

-- STEP 3: Add unique constraint to prevent future duplicates
ALTER TABLE trainer_student 
ADD CONSTRAINT uq_trainer_student_pair 
UNIQUE (trainer_id, student_id);

-- Option 2 (Alternative): Reset orphan requests back to pending
-- Uncomment this if you prefer to reset instead of creating relationships
-- UPDATE trainer_link_request
-- SET status = 'pending', decided_at = NULL
-- WHERE status = 'accepted'
--   AND NOT EXISTS (
--     SELECT 1 
--     FROM trainer_student ts 
--     WHERE ts.trainer_id = trainer_link_request.trainer_id 
--       AND ts.student_id = trainer_link_request.student_id
--   );

-- Check for any remaining orphan records (should return 0)
SELECT COUNT(*) as orphan_count
FROM trainer_link_request tlr
WHERE tlr.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1 
    FROM trainer_student ts 
    WHERE ts.trainer_id = tlr.trainer_id 
      AND ts.student_id = tlr.student_id
  );
