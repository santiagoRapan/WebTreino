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

### 4. block_exercise
Links exercises to routine blocks with specific parameters.

```sql
CREATE TABLE block_exercise (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    block_id uuid NOT NULL REFERENCES routine_block(id) ON DELETE CASCADE,
    exercise_id text NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    display_order int4 NOT NULL,
    sets int4,
    reps text, -- Can be ranges like "8-12" or specific numbers
    load_target text, -- Target weight/resistance
    tempo text, -- Exercise tempo (e.g., "3-1-2-1")
    rest_seconds int4,
    is_superset_group text, -- Groups exercises into supersets
    notes text
);

-- Indexes
CREATE INDEX idx_block_exercise_block_id ON block_exercise(block_id);
CREATE INDEX idx_block_exercise_exercise_id ON block_exercise(exercise_id);
CREATE INDEX idx_block_exercise_order ON block_exercise(block_id, display_order);
CREATE INDEX idx_block_exercise_superset ON block_exercise(is_superset_group);
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

### 6. workout_session
Records individual workout sessions performed by users.

```sql
CREATE TABLE workout_session (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    performer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id uuid REFERENCES routines(id) ON DELETE SET NULL,
    started_at timestamptz DEFAULT NOW(),
    completed_at timestamptz,
    notes text
);

-- Indexes
CREATE INDEX idx_workout_session_performer_id ON workout_session(performer_id);
CREATE INDEX idx_workout_session_routine_id ON workout_session(routine_id);
CREATE INDEX idx_workout_session_started_at ON workout_session(started_at);
CREATE INDEX idx_workout_session_completed_at ON workout_session(completed_at);
```

### 7. workout_set_log
Records individual sets performed during workout sessions.

```sql
CREATE TABLE workout_set_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES workout_session(id) ON DELETE CASCADE,
    exercise_id text NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    block_id uuid REFERENCES routine_block(id) ON DELETE SET NULL,
    block_exercise_id uuid REFERENCES block_exercise(id) ON DELETE SET NULL,
    set_index int4 NOT NULL, -- Which set number (1, 2, 3, etc.)
    reps int4,
    weight numeric,
    rpe numeric, -- Rate of Perceived Exertion (1-10)
    duration_sec int4, -- For time-based exercises
    rest_seconds int4,
    notes text
);

-- Indexes
CREATE INDEX idx_workout_set_log_session_id ON workout_set_log(session_id);
CREATE INDEX idx_workout_set_log_exercise_id ON workout_set_log(exercise_id);
CREATE INDEX idx_workout_set_log_block_id ON workout_set_log(block_id);
CREATE INDEX idx_workout_set_log_block_exercise_id ON workout_set_log(block_exercise_id);
CREATE INDEX idx_workout_set_log_set_index ON workout_set_log(session_id, set_index);
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

```sql
CREATE TABLE IF NOT EXISTS trainer_student (
    trainer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at  timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (trainer_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trainer_student_trainer ON trainer_student(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_student_student ON trainer_student(student_id);
```

### 10. trainer_link_request
Stores vinculación requests/invitations between entrenadors and alumnos.

```sql
CREATE TABLE IF NOT EXISTS trainer_link_request (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_by request_actor NOT NULL,      -- 'alumno' o 'entrenador'
    message      text,
    status       request_status NOT NULL DEFAULT 'pending',
    created_at   timestamptz NOT NULL DEFAULT NOW(),
    decided_at   timestamptz,

    -- Avoid open duplicates for the same pair
    CONSTRAINT uq_open_pair UNIQUE (trainer_id, student_id, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tlr_trainer ON trainer_link_request(trainer_id, status);
CREATE INDEX IF NOT EXISTS idx_tlr_student ON trainer_link_request(student_id, status);
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

### Workout Session Policies

```sql
-- Users can view their own workout sessions
CREATE POLICY "Users can view own workout sessions" ON workout_session
    FOR SELECT USING (performer_id = auth.uid());

-- Users can create their own workout sessions
CREATE POLICY "Users can create workout sessions" ON workout_session
    FOR INSERT WITH CHECK (performer_id = auth.uid());

-- Users can update their own workout sessions
CREATE POLICY "Users can update own workout sessions" ON workout_session
    FOR UPDATE USING (performer_id = auth.uid());

-- Users can delete their own workout sessions
CREATE POLICY "Users can delete own workout sessions" ON workout_session
    FOR DELETE USING (performer_id = auth.uid());
```

### Workout Set Log Policies

```sql
-- Users can view set logs for their own workout sessions
CREATE POLICY "Users can view own workout set logs" ON workout_set_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_session 
            WHERE id = session_id 
            AND performer_id = auth.uid()
        )
    );

-- Users can manage set logs for their own workout sessions
CREATE POLICY "Users can manage own workout set logs" ON workout_set_log
    FOR ALL USING (
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
    IF NEW.status = 'accepted' THEN
        INSERT INTO public.trainer_student(trainer_id, student_id, joined_at)
        VALUES (NEW.trainer_id, NEW.student_id, COALESCE(NEW.decided_at, NOW()))
        ON CONFLICT (trainer_id, student_id) DO NOTHING;
        NEW.decided_at := COALESCE(NEW.decided_at, NOW());
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

## Migration Notes

1. **Existing Data**: If you have existing data, ensure proper migration scripts are created
2. **Indexes**: All suggested indexes should be created for optimal performance
3. **RLS**: Enable and test all RLS policies before going to production
4. **Functions**: Test all custom functions thoroughly
5. **Triggers**: Ensure triggers work correctly with your authentication flow

This schema provides a robust foundation for a comprehensive fitness tracking application with proper security, relationships, and performance optimizations.
