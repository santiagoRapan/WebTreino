# 📦 Schema completo – Supabase + Cloudflare R2

Este esquema elimina toda dependencia de Supabase Storage y utiliza Cloudflare R2 mediante claves (`r2_key`) almacenadas en base de datos.

---

## 🔐 Auth & Usuarios

```sql
CREATE TABLE public.profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_r2_key text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_select_own
ON public.profile
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY profile_update_own
ON public.profile
FOR UPDATE TO authenticated
USING (id = auth.uid());
```

---

## 👥 Relación entrenador / alumno

```sql
CREATE TABLE public.trainer_student (
  trainer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (trainer_id, student_id)
);

ALTER TABLE public.trainer_student ENABLE ROW LEVEL SECURITY;

CREATE POLICY ts_select
ON public.trainer_student
FOR SELECT TO authenticated
USING (trainer_id = auth.uid() OR student_id = auth.uid());
```

---

## 🏋️ Sesiones de entrenamiento

```sql
CREATE TABLE public.workout_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  performer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  performed_at date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.workout_session ENABLE ROW LEVEL SECURITY;

CREATE POLICY ws_select_owner_or_trainer
ON public.workout_session
FOR SELECT TO authenticated
USING (
  performer_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.trainer_student ts
    WHERE ts.student_id = performer_id
      AND ts.trainer_id = auth.uid()
  )
);

CREATE POLICY ws_insert_owner
ON public.workout_session
FOR INSERT TO authenticated
WITH CHECK (performer_id = auth.uid());

CREATE POLICY ws_update_owner
ON public.workout_session
FOR UPDATE TO authenticated
USING (performer_id = auth.uid());

CREATE POLICY ws_delete_owner
ON public.workout_session
FOR DELETE TO authenticated
USING (performer_id = auth.uid());
```

---

## 🖼️ Media de sesiones (Cloudflare R2)

```sql
CREATE TABLE public.workout_session_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL
    REFERENCES public.workout_session(id)
    ON DELETE CASCADE,
  r2_key text NOT NULL,
  mime_type text,
  size_bytes bigint,
  sort_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.workout_session_media ENABLE ROW LEVEL SECURITY;
```

### Policies

```sql
-- SELECT owner or trainer
CREATE POLICY wsm_select_owner_or_trainer
ON public.workout_session_media
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.workout_session ws
    WHERE ws.id = workout_session_media.session_id
      AND (
        ws.performer_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.trainer_student ts
          WHERE ts.student_id = ws.performer_id
            AND ts.trainer_id = auth.uid()
        )
      )
  )
);

-- INSERT owner
CREATE POLICY wsm_insert_owner
ON public.workout_session_media
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workout_session ws
    WHERE ws.id = workout_session_media.session_id
      AND ws.performer_id = auth.uid()
  )
);

-- UPDATE owner
CREATE POLICY wsm_update_owner
ON public.workout_session_media
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workout_session ws
    WHERE ws.id = workout_session_media.session_id
      AND ws.performer_id = auth.uid()
  )
);

-- DELETE owner
CREATE POLICY wsm_delete_owner
ON public.workout_session_media
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workout_session ws
    WHERE ws.id = workout_session_media.session_id
      AND ws.performer_id = auth.uid()
  )
);
```

---

## 📁 Convención de claves en R2

```
users/{USER_ID}/workouts/{SESSION_ID}/{UUID}.jpg
```

---

## 🔐 Flujo de acceso

1. Usuario pide media
2. Backend consulta `workout_session_media`
3. RLS valida permisos
4. Backend genera Signed URL (60s)
5. Frontend consume URL

---

## ⚙️ Variables de entorno (R2)

Requeridas por el backend para generar Signed URLs:

```bash
R2_BUCKET_NAME=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...

# uno de estos dos caminos:
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
# o
R2_ACCOUNT_ID=<ACCOUNT_ID>
```

---

## ✅ Beneficios

* Seguridad completa
* Sin buckets públicos
* Vendor lock-in reducido
* Escalable

---

## 🧠 Nota

Nunca guardar URLs públicas. Siempre guardar `r2_key`.

---

Fin del esquema.
