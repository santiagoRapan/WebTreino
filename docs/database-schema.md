# TREINO App - Database Schema Documentation

This document outlines the complete database schema for the TREINO fitness app based on the existing Supabase structure.

## Overview

The database supports a comprehensive fitness tracking system with exercises, routines, workout sessions, and user management.

## Enums

```sql
CREATE TYPE request_status AS ENUM ('pending','accepted','rejected','canceled');
CREATE TYPE request_actor  AS ENUM ('alumno','entrenador');
```

Note: If migrating from earlier values 'student'/'trainer', rename them:

```sql
ALTER TYPE request_actor RENAME VALUE 'student'  TO 'alumno';
ALTER TYPE request_actor RENAME VALUE 'trainer'  TO 'entrenador';
```

## Tables

### 1. exercises
Stores all available exercises in the system.

```sql
CREATE TABLE public.exercises (
    id text not null,
    name text null,
    "gif_URL" text null,
    target_muscles text[] null,
    body_parts text[] null,
    equipments text[] null,
    secondary_muscles text[] null,
    instructions text null,
    owner_id uuid null,
    constraint exercises_pkey primary key (id),
    constraint exercises_owner_id_fkey foreign KEY (owner_id) references users (id) on delete set null
) TABLESPACE pg_default;

-- Indexes for better performance
CREATE INDEX idx_exercises_name ON public.exercises(name);
CREATE INDEX idx_exercises_target_muscles ON public.exercises USING GIN(target_muscles);
CREATE INDEX idx_exercises_body_parts ON public.exercises USING GIN(body_parts);
```

### 2. routines
Stores workout routines created by trainers or the system.

```sql
CREATE TABLE routines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_on timestamptz DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_routines_owner_id ON routines(owner_id);
CREATE INDEX idx_routines_name ON routines(name);
CREATE INDEX idx_routines_created_on ON routines(created_on);
```

### 3. routine_block
Defines blocks/sections within a routine (e.g., "Warm-up", "Main Set", "Cool-down").

```sql
CREATE TABLE routine_block (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    routine_id uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    name text NOT NULL,
    block_order int4 NOT NULL,
    notes text
);

-- Indexes
CREATE INDEX idx_routine_block_routine_id ON routine_block(routine_id);
CREATE INDEX idx_routine_block_order ON routine_block(routine_id, block_order);
```

### 4b. block_exercise & block_exercise_set (CURRENT IMPLEMENTATION)
**CURRENT:** This is the active implementation. Normalized structure that separates exercise-level data from per-set data.

**Status:** These tables are being prepared for future migration. Current application still uses `block_exercise` (section 4).

**Key Changes:**
- Removes per-set fields (sets, reps, load) from exercise level
- Introduces dedicated `block_exercise_set` table for per-set configuration
- Allows different reps/load per set
- Better support for drop sets, pyramid sets, and variable loading schemes
- Renames `is_superset_group` to `superset_group` for clarity

```sql
-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- v2: Block Exercise (no per-set fields)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.block_exercise (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id uuid NOT NULL
        REFERENCES public.routine_block(id) ON DELETE CASCADE,
    exercise_id text NOT NULL
        REFERENCES public.exercises(id),
    display_order integer NOT NULL,         -- position within the block
    superset_group text NULL,               -- e.g. 'A', 'B' or '1','2' (tag/grouping)
    notes text,

    CONSTRAINT u_block_exercise_v2_order UNIQUE (block_id, display_order)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_block_exercise_v2_block
    ON public.block_exercise(block_id);

CREATE INDEX IF NOT EXISTS idx_block_exercise_v2_exercise
    ON public.block_exercise(exercise_id);

-- ==========================================
-- v2: Per-Set table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.block_exercise_set (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    block_exercise_id uuid NOT NULL
        REFERENCES public.block_exercise(id) ON DELETE CASCADE,

    set_index integer NOT NULL,             -- 1,2,3,...
    reps text,                              -- '8', '8-10', 'AMRAP', 'to failure', etc.
    unit text,                              -- lb, kg, etc.
    load_kg numeric(6,2),                   -- null if BW/N/A
    notes text,

    CONSTRAINT u_block_exercise_set_v2 UNIQUE (block_exercise_id, set_index),
    CONSTRAINT chk_set_v2_idx  CHECK (set_index >= 1),
    CONSTRAINT chk_set_v2_load CHECK (load_kg IS NULL OR load_kg >= 0)
);

CREATE INDEX IF NOT EXISTS idx_block_exercise_set_v2_parent
    ON public.block_exercise_set(block_exercise_id);
```

### 5. trainee_routine
Assigns routines to specific users (trainees).

```sql
CREATE TABLE trainee_routine (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trainee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    assigned_on timestamptz DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trainee_routine_trainee_id ON trainee_routine(trainee_id);
CREATE INDEX idx_trainee_routine_routine_id ON trainee_routine(routine_id);
CREATE INDEX idx_trainee_routine_assigned_on ON trainee_routine(assigned_on);

-- Unique constraint to prevent duplicate assignments
CREATE UNIQUE INDEX idx_trainee_routine_unique ON trainee_routine(trainee_id, routine_id);
```


### 6b. workout_session (CURRENT IMPLEMENTATION)
**CURRENT:** Records individual workout sessions with support for both routine-based and ad-hoc workouts.

```sql
CREATE TABLE IF NOT EXISTS workout_session (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    performer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id uuid NULL REFERENCES routines(id) ON DELETE SET NULL,
    started_at timestamptz NOT NULL DEFAULT NOW(),
    completed_at timestamptz NULL,
    notes text NULL,
    
    CONSTRAINT chk_completed_after_started CHECK (completed_at IS NULL OR completed_at >= started_at)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_session_v2_performer ON workout_session(performer_id);
CREATE INDEX IF NOT EXISTS idx_workout_session_v2_routine ON workout_session(routine_id);
CREATE INDEX IF NOT EXISTS idx_workout_session_v2_started ON workout_session(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_session_v2_completed ON workout_session(completed_at DESC);
```


### 7b. workout_set_log (CURRENT IMPLEMENTATION)
**CURRENT:** Records individual sets with V2 schema support. Handles both routine-based (linked to planned sets) and ad-hoc workouts.

**Key Features:**
- Links to `block_exercise_set` for routine-based workouts
- Supports ad-hoc exercises without routine planning
- Smart uniqueness constraints
- Tracks actual performance vs planned targets

```sql
CREATE TABLE IF NOT EXISTS workout_set_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to the session (required)
    session_id uuid NOT NULL REFERENCES workout_session(id) ON DELETE CASCADE,
    
    -- When following a routine:
    block_exercise_id uuid NULL REFERENCES block_exercise(id) ON DELETE SET NULL,
    block_exercise_set_id uuid NULL REFERENCES block_exercise_set(id) ON DELETE SET NULL,
    
    -- Exercise reference (required for all logs)
    exercise_id text NOT NULL REFERENCES exercises(id),
    
    -- Set ordering within the exercise for this session
    set_index integer NOT NULL DEFAULT 1,
    
    -- Actual performance data
    reps integer NULL,
    weight_kg numeric(8,2) NULL,
    rpe numeric(4,2) NULL,
    duration_sec integer NULL,
    rest_seconds integer NULL,
    notes text NULL,
    performed_at timestamptz NOT NULL DEFAULT NOW(),
    
    -- Validation constraints
    CONSTRAINT chk_set_index_positive CHECK (set_index >= 1),
    CONSTRAINT chk_weight_positive CHECK (weight_kg IS NULL OR weight_kg >= 0),
    CONSTRAINT chk_duration_positive CHECK (duration_sec IS NULL OR duration_sec >= 0),
    CONSTRAINT chk_rest_positive CHECK (rest_seconds IS NULL OR rest_seconds >= 0)
);

-- Fast lookups
CREATE INDEX IF NOT EXISTS idx_set_log_v2_session ON workout_set_log(session_id);
CREATE INDEX IF NOT EXISTS idx_set_log_v2_block_set ON workout_set_log(block_exercise_set_id);
CREATE INDEX IF NOT EXISTS idx_set_log_v2_exercise ON workout_set_log(exercise_id);
CREATE INDEX IF NOT EXISTS idx_set_log_v2_performed ON workout_set_log(performed_at DESC);

-- Uniqueness rules per session:
-- 1) If linked to a prescribed set: one log per (session, prescribed set)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_log_v2_by_prescribed
    ON workout_set_log(session_id, block_exercise_set_id)
    WHERE block_exercise_set_id IS NOT NULL;

-- 2) If ad-hoc (no prescribed set): one log per (session, exercise, set_index)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_log_v2_by_manual
    ON workout_set_log(session_id, exercise_id, set_index)
    WHERE block_exercise_set_id IS NULL;
```

### 8. users (Extended Profile)
Extended user profile information (references auth.users).

```sql
CREATE TABLE users (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name text,
    role text DEFAULT 'alumno' CHECK (role IN ('alumno', 'entrenador', 'admin')),
    avatar_url text,
    created_on timestamptz DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_on ON users(created_on);
```

### 9. trainer_student
Links entrenadors (trainers) to alumnos (students) once a request/invitation is accepted.

**IMPORTANT:** This table has an `id` column as the primary key to allow the `message` table to reference conversations via `conversation_id`.

```sql
CREATE TABLE IF NOT EXISTS trainer_student (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at  timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT trainer_student_trainer_student_unique UNIQUE (trainer_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trainer_student_trainer ON trainer_student(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_student_student ON trainer_student(student_id);
```

**Note:** The unique constraint on `(trainer_id, student_id)` ensures that a trainer-student relationship can only exist once, while the `id` column serves as the primary key for foreign key references (especially from the `message` table).

### 10. trainer_link_request
Stores vinculación requests/invitations between entrenadors and alumnos.

```sql
CREATE TABLE IF NOT EXISTS trainer_link_request (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message text NULL,
    status request_status NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT NOW(),
    decided_at timestamptz NULL,
    requested_by request_actor NOT NULL,
    CONSTRAINT trainer_link_request_pkey PRIMARY KEY (id),
    CONSTRAINT uq_open_pair UNIQUE (trainer_id, student_id, status) DEFERRABLE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tlr_trainer ON trainer_link_request(trainer_id, status);
CREATE INDEX IF NOT EXISTS idx_tlr_student ON trainer_link_request(student_id, status);

-- Trigger for auto-creating trainer_student relationship on acceptance
CREATE TRIGGER trg_request_accept
AFTER UPDATE OF status ON trainer_link_request
FOR EACH ROW WHEN (
    NEW.status = 'accepted' 
    AND OLD.status IS DISTINCT FROM NEW.status
)
EXECUTE FUNCTION handle_request_accepted();
```

### 11. message
Stores chat messages between trainers and students.

**Status:** ✅ Fully implemented with real-time support. See `/docs/chat-implementation.md` for usage guide.

**Key Design:** Messages are linked to trainer_student relationships via `conversation_id`, which references the `trainer_student(id)`. This ensures that all messages for a specific trainer-student pairing are grouped together.

```sql
CREATE TABLE IF NOT EXISTS public.message (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    content text NOT NULL,
    sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id uuid NOT NULL REFERENCES trainer_student(id) ON DELETE CASCADE,
    
    -- Ensure content is not empty
    CONSTRAINT chk_content_not_empty CHECK (
        content IS NOT NULL AND LENGTH(TRIM(content)) > 0
    )
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_conversation ON message(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_sender ON message(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON message(created_at DESC);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE message;
```

**Future Enhancements:**
To add read receipts and message editing features, consider adding:
```sql
-- Add these columns if needed:
ALTER TABLE message ADD COLUMN read_at timestamptz NULL;
ALTER TABLE message ADD COLUMN edited_at timestamptz NULL;
ALTER TABLE message ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;

-- Add index for unread messages:
CREATE INDEX IF NOT EXISTS idx_message_unread ON message(conversation_id, read_at) 
WHERE read_at IS NULL;
```

## Row Level Security (RLS) Policies

### Enable RLS on all tables

```sql
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_exercise ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainee_routine ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_set_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_link_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE message ENABLE ROW LEVEL SECURITY;
```

### Exercises Policies

```sql
-- All authenticated users can view exercises
CREATE POLICY "Anyone can view exercises" ON exercises
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only entrenadors and admins can manage exercises
CREATE POLICY "Entrenadors can manage exercises" ON exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('entrenador', 'admin')
        )
    );
```

```sql
-- Ensure RLS is enabled on the new table (run once)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- 1) Owners can view their own exercises
CREATE POLICY exercises_select_own
ON public.exercises
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- 2) Students can view their trainer's exercises
CREATE POLICY exercises_select_if_student_of_owner
ON public.exercises
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.trainer_student ts
    WHERE ts.trainer_id = public.exercises.owner_id
      AND ts.student_id = auth.uid()
  )
);
```

### Routines Policies

```sql
-- Users can view routines they own or are assigned to
CREATE POLICY "Users can view accessible routines" ON routines
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM trainee_routine 
            WHERE routine_id = routines.id 
            AND trainee_id = auth.uid()
        )
    );

-- Users can create their own routines
CREATE POLICY "Users can create routines" ON routines
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own routines
CREATE POLICY "Users can update own routines" ON routines
    FOR UPDATE USING (owner_id = auth.uid());

-- Users can delete their own routines
CREATE POLICY "Users can delete own routines" ON routines
    FOR DELETE USING (owner_id = auth.uid());
```

### Routine Block Policies

```sql
-- Users can view blocks for routines they own OR are assigned to them
CREATE POLICY "Users can view accessible routine blocks" ON routine_block
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE id = routine_block.routine_id 
            AND (
                owner_id = auth.uid() 
                OR 
                EXISTS (
                    SELECT 1 FROM trainee_routine 
                    WHERE routine_id = routines.id 
                    AND trainee_id = auth.uid()
                )
            )
        )
    );

-- Users can INSERT blocks for their own routines
CREATE POLICY "Users can insert own routine blocks" ON routine_block
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE id = routine_id 
            AND owner_id = auth.uid()
        )
    );

-- Users can UPDATE blocks for their own routines
CREATE POLICY "Users can update own routine blocks" ON routine_block
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE id = routine_block.routine_id 
            AND owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE id = routine_id 
            AND owner_id = auth.uid()
        )
    );

-- Users can DELETE blocks for their own routines
CREATE POLICY "Users can delete own routine blocks" ON routine_block
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE id = routine_block.routine_id 
            AND owner_id = auth.uid()
        )
    );
```

### Block Exercise Policies

```sql
-- Users can view exercises in blocks they have access to
CREATE POLICY "Users can view accessible block exercises" ON block_exercise
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM routine_block rb
            JOIN routines r ON r.id = rb.routine_id
            WHERE rb.id = block_exercise.block_id 
            AND (
                r.owner_id = auth.uid() 
                OR 
                EXISTS (
                    SELECT 1 FROM trainee_routine 
                    WHERE routine_id = r.id 
                    AND trainee_id = auth.uid()
                )
            )
        )
    );

-- Users can INSERT exercises in their own routine blocks
CREATE POLICY "Users can insert own block exercises" ON block_exercise
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM routine_block rb
            JOIN routines r ON r.id = rb.routine_id
            WHERE rb.id = block_id 
            AND r.owner_id = auth.uid()
        )
    );

-- Users can UPDATE exercises in their own routine blocks
CREATE POLICY "Users can update own block exercises" ON block_exercise
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM routine_block rb
            JOIN routines r ON r.id = rb.routine_id
            WHERE rb.id = block_exercise.block_id 
            AND r.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM routine_block rb
            JOIN routines r ON r.id = rb.routine_id
            WHERE rb.id = block_id 
            AND r.owner_id = auth.uid()
        )
    );

-- Users can DELETE exercises in their own routine blocks
CREATE POLICY "Users can delete own block exercises" ON block_exercise
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM routine_block rb
            JOIN routines r ON r.id = rb.routine_id
            WHERE rb.id = block_exercise.block_id 
            AND r.owner_id = auth.uid()
        )
    );
```

### Trainee Routine Policies

```sql
-- Users can view their own routine assignments
CREATE POLICY "Users can view own routine assignments" ON trainee_routine
    FOR SELECT USING (trainee_id = auth.uid());

-- En trainee_routine, permitir INSERT solo si:
--   1) la rutina pertenece al entrenador autenticado
--   2) el alumno está en su roster (trainer_student)
CREATE POLICY "Trainer can only assign routine to his trainer_students" ON trainee_routine
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM routines r
            WHERE r.id = routine_id AND r.owner_id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM trainer_student ts
            WHERE ts.trainer_id = auth.uid() AND ts.student_id = trainee_id
        )
    );

-- Entrenadors can manage assignments of their routines
CREATE POLICY "Entrenadors can manage routine assignments" ON trainee_routine
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM routines 
            WHERE id = routine_id 
            AND owner_id = auth.uid()
        )
    );
```


### Workout Session V2 Policies (CURRENT)

```sql
-- Users can view their own workout sessions
CREATE POLICY "Users can view own workout sessions v2" ON workout_session
    FOR SELECT USING (performer_id = auth.uid());

-- Users can create their own workout sessions
CREATE POLICY "Users can create workout sessions v2" ON workout_session
    FOR INSERT WITH CHECK (performer_id = auth.uid());

-- Users can update their own workout sessions
CREATE POLICY "Users can update own workout sessions v2" ON workout_session
    FOR UPDATE USING (performer_id = auth.uid());

-- Users can delete their own workout sessions
CREATE POLICY "Users can delete own workout sessions v2" ON workout_session
    FOR DELETE USING (performer_id = auth.uid());
```


### Workout Set Log V2 Policies (CURRENT)

```sql
-- Users can view set logs for their own workout sessions
CREATE POLICY "Users can view own workout set logs v2" ON workout_set_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_session 
            WHERE id = session_id 
            AND performer_id = auth.uid()
        )
    );

-- Users can create set logs for their own workout sessions
CREATE POLICY "Users can create workout set logs v2" ON workout_set_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_session 
            WHERE id = session_id 
            AND performer_id = auth.uid()
        )
    );

-- Users can update set logs for their own workout sessions
CREATE POLICY "Users can update workout set logs v2" ON workout_set_log
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workout_session 
            WHERE id = session_id 
            AND performer_id = auth.uid()
        )
    );

-- Users can delete set logs for their own workout sessions
CREATE POLICY "Users can delete workout set logs v2" ON workout_set_log
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workout_session 
            WHERE id = session_id 
            AND performer_id = auth.uid()
        )
    );
```

### Users Profile Policies

```sql
-- Users can view all profiles (for trainer-trainee relationships)
CREATE POLICY "Users can view profiles" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can create own profile" ON users
    FOR INSERT WITH CHECK (id = auth.uid());
```

### Trainer-Student Relationship Policies

```sql
-- Roster visibility: entrenador sees roster
CREATE POLICY "entrenador ve su roster" ON trainer_student
    FOR SELECT USING (trainer_id = auth.uid());

-- Alumno sees their trainers
CREATE POLICY "alumno ve sus entrenadores" ON trainer_student
    FOR SELECT USING (student_id = auth.uid());

-- Trainers can delete students from their roster
CREATE POLICY "entrenador puede eliminar de su roster" ON trainer_student
    FOR DELETE USING (trainer_id = auth.uid());

-- Students can unlink themselves from trainers
CREATE POLICY "alumno puede desvincularse de entrenador" ON trainer_student
    FOR DELETE USING (student_id = auth.uid());
```

### Trainer Link Request Policies

```sql
-- Entrenadores o alumnos involucrados pueden ver la solicitud
CREATE POLICY "ver solicitudes propias o dirigidas" ON trainer_link_request
    FOR SELECT USING (trainer_id = auth.uid() OR student_id = auth.uid());

-- Alumno crea solicitud hacia un entrenador
CREATE POLICY "alumno crea solicitud" ON trainer_link_request
    FOR INSERT WITH CHECK (requested_by = 'alumno' AND student_id = auth.uid() AND status = 'pending');

-- Entrenador crea invitación hacia un alumno
CREATE POLICY "entrenador crea invitacion" ON trainer_link_request
    FOR INSERT WITH CHECK (requested_by = 'entrenador' AND trainer_id = auth.uid() AND status = 'pending');

-- Quien la inició puede CANCELAR mientras esté pendiente
CREATE POLICY "solicitante cancela pending" ON trainer_link_request
    FOR UPDATE USING (
        status = 'pending' AND (
            (requested_by = 'alumno'     AND student_id = auth.uid()) OR
            (requested_by = 'entrenador' AND trainer_id = auth.uid())
        )
    )
    WITH CHECK (status = 'canceled');

-- La contraparte puede ACEPTAR o RECHAZAR
CREATE POLICY "contraparte acepta/rechaza" ON trainer_link_request
    FOR UPDATE USING (
        status = 'pending' AND (
            (requested_by = 'alumno'     AND trainer_id = auth.uid()) OR
            (requested_by = 'entrenador' AND student_id = auth.uid())
        )
    )
    WITH CHECK (status IN ('accepted','rejected'));
```

### Message Policies

```sql
-- Users can view messages in conversations they are part of
CREATE POLICY "Users can view their messages" ON message
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trainer_student ts
            WHERE ts.id = message.conversation_id
            AND (ts.trainer_id = auth.uid() OR ts.student_id = auth.uid())
        )
    );

-- Users can send messages only in conversations where they are linked
CREATE POLICY "Users can send messages to linked partners" ON message
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM trainer_student ts
            WHERE ts.id = conversation_id
            AND (ts.trainer_id = auth.uid() OR ts.student_id = auth.uid())
        )
    );

-- Users can only update their own messages
CREATE POLICY "Users can update their own messages" ON message
    FOR UPDATE USING (
        sender_id = auth.uid()
    )
    WITH CHECK (
        sender_id = auth.uid()
    );

-- Users can delete their own messages (hard delete)
CREATE POLICY "Users can delete their own messages" ON message
    FOR DELETE USING (
        sender_id = auth.uid()
    );
```

## Functions and Triggers

### Auto-create user profile on signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Function to check if user has assigned routines

```sql
CREATE OR REPLACE FUNCTION has_assigned_routines(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM trainee_routine 
        WHERE trainee_id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Handle acceptance of trainer link requests

Creates roster entry on acceptance of a `trainer_link_request`.

```sql
CREATE OR REPLACE FUNCTION public.handle_request_accepted()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Check if relationship already exists before inserting
    IF NOT EXISTS (
      SELECT 1 FROM public.trainer_student 
      WHERE trainer_id = NEW.trainer_id AND student_id = NEW.student_id
    ) THEN
      INSERT INTO public.trainer_student (trainer_id, student_id, joined_at)
      VALUES (NEW.trainer_id, NEW.student_id, COALESCE(NEW.decided_at, NOW()));
    END IF;

    IF NEW.decided_at IS NULL THEN
      NEW.decided_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_request_accept ON public.trainer_link_request;
CREATE TRIGGER trg_request_accept
AFTER UPDATE OF status ON public.trainer_link_request
FOR EACH ROW
WHEN (NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM NEW.status)
EXECUTE PROCEDURE public.handle_request_accepted();
```

### Function to cancel and delete a trainer request

Securely deletes a pending trainer link request initiated by the current student.

```sql
CREATE OR REPLACE FUNCTION public.cancel_my_trainer_request(trainer_id_to_cancel uuid)
RETURNS void AS $$
DECLARE
    student_id_to_cancel uuid := auth.uid();
BEGIN
    -- Abort if student is not authenticated
    IF student_id_to_cancel IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    DELETE FROM public.trainer_link_request
    WHERE
        trainer_id = trainer_id_to_cancel
        AND student_id = student_id_to_cancel
        AND requested_by = 'alumno'
        AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Function to unlink trainer from student

Removes trainer-student link, associated requests, and routine assignments.

```sql
CREATE OR REPLACE FUNCTION public.unlink_trainer_and_routines(trainer_id_to_unlink uuid)
RETURNS void AS $$
DECLARE
    student_id_to_unlink uuid := auth.uid();
BEGIN
    -- Abort if student is not authenticated
    IF student_id_to_unlink IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Step 1: Delete routine assignments from the specified trainer
    DELETE FROM public.trainee_routine
    WHERE
        trainee_id = student_id_to_unlink
        AND routine_id IN (
            SELECT id FROM public.routines WHERE owner_id = trainer_id_to_unlink
        );

    -- Step 2: Delete the trainer-student relationship
    DELETE FROM public.trainer_student
    WHERE trainer_id = trainer_id_to_unlink AND student_id = student_id_to_unlink;

    -- Step 3: Delete any associated link requests
    DELETE FROM public.trainer_link_request
    WHERE trainer_id = trainer_id_to_unlink AND student_id = student_id_to_unlink;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Chat/Message Functions

**Note:** The current `message` table implementation uses a simple schema without `read_at`, `edited_at`, or `is_deleted` columns. These functions would require those columns to be added first (see Future Enhancements in the message table section).

The chat functionality is currently implemented at the application level in `/services/chat.ts`. See `/docs/chat-implementation.md` for details on how to use the chat system.

**Future Database Functions (requires schema enhancements):**

Once you add `read_at` column to the `message` table, you can create these functions:

```sql
-- Function to mark messages as read (requires read_at column)
CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(
    conv_id uuid
)
RETURNS integer AS $$
DECLARE
    current_user_id uuid := auth.uid();
    updated_count integer;
BEGIN
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    UPDATE public.message
    SET read_at = NOW()
    WHERE conversation_id = conv_id
        AND sender_id != current_user_id
        AND read_at IS NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count (requires read_at column)
CREATE OR REPLACE FUNCTION public.get_unread_message_count()
RETURNS integer AS $$
DECLARE
    current_user_id uuid := auth.uid();
    unread_count integer;
BEGIN
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    SELECT COUNT(*)::integer INTO unread_count
    FROM public.message m
    JOIN public.trainer_student ts ON ts.id = m.conversation_id
    WHERE (ts.trainer_id = current_user_id OR ts.student_id = current_user_id)
        AND m.sender_id != current_user_id
        AND m.read_at IS NULL;

    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Usage Examples

### Check if user has assigned routines

```sql
SELECT has_assigned_routines();
```

### Get user's assigned routines with details

```sql
SELECT 
    r.id,
    r.name,
    r.description,
    tr.assigned_on,
    u.name as trainer_name
FROM trainee_routine tr
JOIN routines r ON r.id = tr.routine_id
JOIN users u ON u.id = r.owner_id
WHERE tr.trainee_id = auth.uid()
ORDER BY tr.assigned_on DESC;
```

### Get routine structure with exercises

```sql
SELECT 
    r.name as routine_name,
    rb.name as block_name,
    rb.block_order,
    e.name as exercise_name,
    be.sets,
    be.reps,
    be.load_target,
    be.display_order
FROM routines r
JOIN routine_block rb ON rb.routine_id = r.id
JOIN block_exercise be ON be.block_id = rb.id
JOIN exercises e ON e.id = be.exercise_id
WHERE r.id = $1
ORDER BY rb.block_order, be.display_order;
```

### Get workout session history

```sql
SELECT 
    ws.id,
    ws.started_at,
    ws.completed_at,
    r.name as routine_name,
    COUNT(wsl.id) as total_sets
FROM workout_session ws
LEFT JOIN routines r ON r.id = ws.routine_id
LEFT JOIN workout_set_log wsl ON wsl.session_id = ws.id
WHERE ws.performer_id = auth.uid()
GROUP BY ws.id, ws.started_at, ws.completed_at, r.name
ORDER BY ws.started_at DESC;
```

### Schema Usage Examples

#### Get routine structure with per-set details

```sql
SELECT 
    r.name as routine_name,
    rb.name as block_name,
    rb.block_order,
    e.name as exercise_name,
    be.display_order,
    be.superset_group,
    bes.set_index,
    bes.reps,
    bes.load_kg,
    bes.unit,
    bes.notes as set_notes
FROM routines r
JOIN routine_block rb ON rb.routine_id = r.id
JOIN block_exercise be ON be.block_id = rb.id
JOIN block_exercise_set bes ON bes.block_exercise_id = be.id
JOIN exercises e ON e.id = be.exercise_id
WHERE r.id = $1
ORDER BY rb.block_order, be.display_order, bes.set_index;
```

#### Create exercise with multiple sets (v2)

```sql
-- Insert the exercise
INSERT INTO block_exercise (block_id, exercise_id, display_order, superset_group, notes)
VALUES ($1, $2, $3, NULL, 'Focus on form')
RETURNING id;

-- Insert sets with different parameters (e.g., pyramid set)
INSERT INTO block_exercise_set (block_exercise_id, set_index, reps, load_kg, unit)
VALUES 
    ($exerciseId, 1, '12', 50, 'kg'),
    ($exerciseId, 2, '10', 60, 'kg'),
    ($exerciseId, 3, '8', 70, 'kg'),
    ($exerciseId, 4, '10', 60, 'kg'),
    ($exerciseId, 5, '12', 50, 'kg');
```

#### Get superset groups with all sets (v2)

```sql
SELECT 
    be.superset_group,
    e.name as exercise_name,
    be.display_order,
    jsonb_agg(
        jsonb_build_object(
            'set_index', bes.set_index,
            'reps', bes.reps,
            'load_kg', bes.load_kg,
            'unit', bes.unit,
            'notes', bes.notes
        ) ORDER BY bes.set_index
    ) as sets
FROM block_exercise be
JOIN exercises e ON e.id = be.exercise_id
JOIN block_exercise_set bes ON bes.block_exercise_id = be.id
WHERE be.block_id = $1 
  AND be.superset_group IS NOT NULL
GROUP BY be.superset_group, e.name, be.display_order
ORDER BY be.superset_group, be.display_order;
```

#### Count total sets in a routine (v2)

```sql
SELECT 
    r.name,
    COUNT(bes.id) as total_sets,
    COUNT(DISTINCT be.id) as total_exercises
FROM routines r
JOIN routine_block rb ON rb.routine_id = r.id
JOIN block_exercise be ON be.block_id = rb.id
LEFT JOIN block_exercise_set bes ON bes.block_exercise_id = be.id
WHERE r.id = $1
GROUP BY r.id, r.name;
```

### Get messages for a conversation

```sql
-- Get messages between current user and another user using conversation_id
-- First, get the conversation_id
WITH conv AS (
    SELECT id as conversation_id
    FROM trainer_student
    WHERE (trainer_id = auth.uid() AND student_id = $1)
       OR (student_id = auth.uid() AND trainer_id = $1)
    LIMIT 1
)
SELECT 
    m.id,
    m.content,
    m.sender_id,
    m.created_at,
    m.conversation_id,
    u.name as sender_name,
    u.avatar_url as sender_avatar
FROM message m
JOIN users u ON u.id = m.sender_id
JOIN conv ON conv.conversation_id = m.conversation_id
ORDER BY m.created_at ASC;
```

### Send a message

```sql
-- Get the conversation_id and insert message
WITH conv AS (
    SELECT id as conversation_id
    FROM trainer_student
    WHERE (trainer_id = auth.uid() AND student_id = $1)
       OR (student_id = auth.uid() AND trainer_id = $1)
    LIMIT 1
)
INSERT INTO message (conversation_id, sender_id, content)
SELECT 
    conv.conversation_id,
    auth.uid(),
    $2  -- message content
FROM conv
RETURNING *;
```

### Get conversations with latest message

```sql
-- Get all trainer_student relationships for current user with latest message
SELECT 
    ts.id as conversation_id,
    ts.trainer_id,
    ts.student_id,
    CASE 
        WHEN ts.trainer_id = auth.uid() THEN s.name
        ELSE t.name
    END as other_user_name,
    CASE 
        WHEN ts.trainer_id = auth.uid() THEN s.avatar_url
        ELSE t.avatar_url
    END as other_user_avatar,
    (
        SELECT content 
        FROM message 
        WHERE conversation_id = ts.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) as latest_message,
    (
        SELECT created_at 
        FROM message 
        WHERE conversation_id = ts.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) as latest_message_time
FROM trainer_student ts
LEFT JOIN users t ON t.id = ts.trainer_id
LEFT JOIN users s ON s.id = ts.student_id
WHERE ts.trainer_id = auth.uid() OR ts.student_id = auth.uid()
ORDER BY latest_message_time DESC NULLS LAST;
```

### Chat API Usage

For chat functionality, use the TypeScript service layer in `/services/chat.ts`:

```typescript
import { getConversationMessages, sendMessage, getChatConversations } from '@/services/chat';

// Load messages
const messages = await getConversationMessages(otherUserId);

// Send a message
await sendMessage(otherUserId, 'Hello!');

// Get conversations list
const conversations = await getChatConversations();
```

See `/docs/chat-implementation.md` for complete API documentation.

## Real-Time Setup

### Enable Real-Time on Required Tables

**IMPORTANT:** For real-time subscriptions to work, tables must be added to the `supabase_realtime` publication.

**Required tables for real-time:**
- `message` - Chat messages
- `trainer_link_request` - Trainer connection requests
- `trainer_student` - Trainer-student relationships

#### Method 1: Enable Real-Time in Supabase Dashboard

Navigate to Database → Replication and enable replication for each table:
- `message`
- `trainer_link_request`
- `trainer_student`

#### Method 2: Use SQL Migration

Run the migration script in `/database/migrations/enable_realtime_subscriptions.sql`:

```sql
-- Enable realtime for all required tables
ALTER PUBLICATION supabase_realtime ADD TABLE message;
ALTER PUBLICATION supabase_realtime ADD TABLE trainer_link_request;
ALTER PUBLICATION supabase_realtime ADD TABLE trainer_student;

-- Set REPLICA IDENTITY to FULL (required for realtime)
ALTER TABLE message REPLICA IDENTITY FULL;
ALTER TABLE trainer_link_request REPLICA IDENTITY FULL;
ALTER TABLE trainer_student REPLICA IDENTITY FULL;
```

#### Verify Tables are Added

```sql
-- Check which tables are in the realtime publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Enable Real-Time on message table (DEPRECATED - Use Method 2 above)

To enable real-time updates for messages, follow these steps:

1. **Enable Real-Time in Supabase Dashboard:**
   - Navigate to Database → Replication
   - Find the `message` table
   - Enable replication for the table

2. **Or use SQL to enable it:**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE message;
   ```

3. **Client-side subscription (use the service functions):**
   ```typescript
   import { subscribeToConversation, unsubscribeFromConversation } from '@/services/chat';
   
   // Subscribe to messages in a conversation
   const channel = subscribeToConversation(conversationId, (payload) => {
     console.log('Message update:', payload);
     if (payload.eventType === 'INSERT') {
       // Add new message to UI
     } else if (payload.eventType === 'UPDATE') {
       // Update existing message
     } else if (payload.eventType === 'DELETE') {
       // Remove message from UI
     }
   });
   
   // Cleanup when done
   await unsubscribeFromConversation(channel);
   ```

4. **Direct Supabase subscription (advanced):**
   ```typescript
   import { supabase } from './lib/supabase';
   
   // Subscribe to messages in a specific conversation
   const subscribeToMessages = (conversationId: string) => {
     const channel = supabase
       .channel(`conversation:${conversationId}`)
       .on(
         'postgres_changes',
         {
           event: '*',  // Listen to INSERT, UPDATE, DELETE
           schema: 'public',
           table: 'message',
           filter: `conversation_id=eq.${conversationId}`
         },
         (payload) => {
           console.log('Message update:', payload);
           // Handle the message change
         }
       )
       .subscribe();
     
     return channel;
   };
   
   // Cleanup
   const unsubscribe = (channel) => {
     supabase.removeChannel(channel);
   };
   ```

For complete implementation examples, see `/docs/chat-implementation.md` and `/services/chat.ts`.

## Migration Notes

1. **Existing Data**: If you have existing data, ensure proper migration scripts are created
2. **Indexes**: All suggested indexes should be created for optimal performance
3. **RLS**: Enable and test all RLS policies before going to production
4. **Functions**: Test all custom functions thoroughly
5. **Triggers**: Ensure triggers work correctly with your authentication flow

### Migration from V1 to V2 (COMPLETED)

**Status:** ✅ Migration complete. The application now exclusively uses `block_exercise` and `block_exercise_set` tables.

**What Changed:**
- Removed flat set/reps structure from `block_exercise` (V1)
- Introduced per-set customization with `block_exercise_set`
- All V1 handlers, hooks, and components have been removed
- Export aliases created for backward compatibility

**If you have legacy data in `block_exercise` table, migrate it using:**
   ```sql
   -- Example migration logic
    INSERT INTO block_exercise (block_id, exercise_id, display_order, superset_group, notes)
   SELECT block_id, exercise_id, display_order, is_superset_group, notes
   FROM block_exercise;
   
   -- For each exercise, create sets based on the old 'sets' field
    INSERT INTO block_exercise_set (block_exercise_id, set_index, reps, load_kg)
   SELECT 
       v2.id,
       generate_series(1, COALESCE(v1.sets, 1)),
       v1.reps,
       -- Parse load_target to extract numeric value if possible
       NULL
   FROM block_exercise v1
    JOIN block_exercise v2 ON v1.block_id = v2.block_id 
       AND v1.exercise_id = v2.exercise_id 
       AND v1.display_order = v2.display_order;
   ```
4. **Enable RLS policies** - Add security policies for v2 tables (see below)

**RLS Policies:**
```sql
-- Enable RLS
ALTER TABLE block_exercise ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_exercise_set ENABLE ROW LEVEL SECURITY;

-- Add policies as needed (follow existing patterns from other tables)
-- SELECT, INSERT, UPDATE, DELETE policies
```

**Benefits of Current Schema:**
- ✅ Per-set customization (different reps/weight per set)
- ✅ Support for advanced training techniques (drop sets, pyramids, etc.)
- ✅ More flexible data structure
- ✅ Better normalization
- ✅ Easier to implement progressive overload tracking

This schema provides a robust foundation for a comprehensive fitness tracking application with proper security, relationships, and performance optimizations.