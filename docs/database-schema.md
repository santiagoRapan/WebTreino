-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

# 📋 Esquema de Base de Datos - Treino Web

Este documento describe todas las tablas de la base de datos Supabase utilizadas en la aplicación.

---

## 🏋️ Sistema de Rutinas (Workout Routines)

### Jerarquía de Rutinas
```
routines → routine_block → block_exercise → block_exercise_set
```

**Flujo**: Una rutina contiene múltiples bloques, cada bloque contiene múltiples ejercicios, y cada ejercicio tiene múltiples sets configurados.

---

### `routines`
Tabla principal que almacena las rutinas de entrenamiento creadas por los entrenadores.

### `routine_block`
Bloques dentro de una rutina. Permite organizar ejercicios en grupos (ej: "Calentamiento", "Fuerza", "Cardio").

### `block_exercise`
Ejercicios dentro de un bloque. Referencia ejercicios de la tabla `exercises` y define orden y agrupación (supersets).

### `block_exercise_set`
Sets individuales de un ejercicio con configuración específica (reps, peso, descanso). Permite configuración diferente por cada set.

---

## 📊 Tablas de Rutinas (Schema SQL)

CREATE TABLE public.block_exercise (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL,
  exercise_id text NOT NULL,
  display_order integer NOT NULL,
  superset_group text,
  notes text,
  rest_seconds integer,
  CONSTRAINT block_exercise_pkey PRIMARY KEY (id),
  CONSTRAINT block_exercise_v2_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.routine_block(id),
  CONSTRAINT block_exercise_v2_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
CREATE TABLE public.block_exercise_set (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  block_exercise_id uuid NOT NULL,
  set_index integer NOT NULL CHECK (set_index >= 1),
  reps text,
  unit text,
  load_kg numeric CHECK (load_kg IS NULL OR load_kg >= 0::numeric),
  notes text,
  rest_time_seconds integer CHECK (rest_time_seconds IS NULL OR rest_time_seconds >= 0),
  CONSTRAINT block_exercise_set_pkey PRIMARY KEY (id),
  CONSTRAINT block_exercise_set_v2_block_exercise_id_fkey FOREIGN KEY (block_exercise_id) REFERENCES public.block_exercise(id)
);

---

## 📈 Registro de Peso Corporal

### `body_weight_log`
Registro histórico del peso corporal de los usuarios para seguimiento de progreso.

CREATE TABLE public.body_weight_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  weight_kg numeric NOT NULL CHECK (weight_kg > 0::numeric AND weight_kg <= 500::numeric),
  recorded_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  CONSTRAINT body_weight_log_pkey PRIMARY KEY (id),
  CONSTRAINT body_weight_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

---

## 💪 Librería de Ejercicios

### `exercises`
Base de datos de ejercicios disponibles. Incluye ejercicios del sistema y ejercicios personalizados creados por entrenadores.

- **owner_id**: NULL para ejercicios del sistema, UUID del entrenador para ejercicios personalizados
- **score**: Sistema de puntuación para ranking/búsqueda

CREATE TABLE public.exercises (
  id text NOT NULL,
  name text,

---

## 👥 Sistema Social

### `follow_request`
Solicitudes de seguimiento entre usuarios (sistema de red social interna).

### `friend_request`
Solicitudes de amistad entre usuarios.

### `friendship`
Relaciones de amistad activas entre usuarios.

### `user_follow`
Seguimientos activos entre usuarios (usuario A sigue a usuario B).

  gif_URL text,
  target_muscles ARRAY,
  body_parts ARRAY,
  equipments ARRAY,
  secondary_muscles ARRAY,
  instructions text,
  owner_id uuid,
  score bigint DEFAULT '0'::bigint,
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.follow_request (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  requested_id uuid NOT NULL,
  message text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::request_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  decided_at timestamp with time zone,
  requested_by USER-DEFINED NOT NULL,
  CONSTRAINT follow_request_pkey PRIMARY KEY (id),
  CONSTRAINT follow_request_requester_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id),
  CONSTRAINT follow_request_requested_fkey FOREIGN KEY (requested_id) REFERENCES auth.users(id)
);
CREATE TABLE public.friend_request (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  requested_id uuid NOT NULL,
  message text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::request_status,

---

## 👤 Gestión de Usuarios Invitados

### `guests`
Permite a los entrenadores gestionar clientes/alumnos que aún no tienen cuenta en la plataforma.

- **linked_user_id**: Se llena cuando el invitado crea una cuenta y se vincula

  created_at timestamp with time zone NOT NULL DEFAULT now(),
  decided_at timestamp with time zone,
  requested_by USER-DEFINED NOT NULL,
  CONSTRAINT friend_request_pkey PRIMARY KEY (id),
  CONSTRAINT friend_request_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES auth.users(id),

---

## 💬 Sistema de Mensajería

### `lead_conversation`
Conversaciones entre entrenadores y potenciales estudiantes (leads).

### `lead_message`
Mensajes individuales dentro de las conversaciones lead.

### `message`
Sistema de mensajería general entre usuarios vinculados (entrenador-estudiante).

  CONSTRAINT friend_request_requested_id_fkey FOREIGN KEY (requested_id) REFERENCES auth.users(id)
);
CREATE TABLE public.friendship (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id_1 uuid NOT NULL,
  user_id_2 uuid NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'blocked'::text, 'inactive'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT friendship_pkey PRIMARY KEY (id),
  CONSTRAINT friendship_user1_fkey FOREIGN KEY (user_id_1) REFERENCES auth.users(id),
  CONSTRAINT friendship_user2_fkey FOREIGN KEY (user_id_2) REFERENCES auth.users(id)
);
CREATE TABLE public.guests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  notes text,
  linked_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text])),
  CONSTRAINT guests_pkey PRIMARY KEY (id),
  CONSTRAINT guests_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.users(id),
  CONSTRAINT fk_guests_linked_user_auth_users FOREIGN KEY (linked_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.lead_conversation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone,
  status text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'closed'::text])),

---

## 🔗 Asignación de Rutinas

### `trainee_routine`
Asigna rutinas específicas a estudiantes. Un estudiante puede tener múltiples rutinas asignadas.

- **display_order**: Orden en que se muestran las rutinas al estudiante

  CONSTRAINT lead_conversation_pkey PRIMARY KEY (id),
  CONSTRAINT lead_conversation_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES auth.users(id),
  CONSTRAINT lead_conversation_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id)
);
CREATE TABLE public.lead_message (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lead_message_pkey PRIMARY KEY (id),
  CONSTRAINT lead_message_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.lead_conversation(id),
  CONSTRAINT lead_message_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.message (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  content text NOT NULL,
  sender_id uuid NOT NULL,

---

## 🤝 Relación Entrenador-Estudiante

### `trainer_link_request`
Solicitudes de vinculación entre entrenadores y estudiantes.

- **requested_by**: Indica quién inició la solicitud (entrenador o estudiante)
- **status**: pending | accepted | rejected

### `trainer_student`
Relación activa entre entrenador y estudiante. Esta es la tabla central de la relación.

  conversation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT message_pkey PRIMARY KEY (id),
  CONSTRAINT message_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.trainer_student(id),
  CONSTRAINT message_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.routine_block (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  routine_id uuid NOT NULL,
  name text,
  block_order integer NOT NULL,
  notes text,
  CONSTRAINT routine_block_pkey PRIMARY KEY (id),
  CONSTRAINT routine_block_workout_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id)
);
CREATE TABLE public.routines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_on timestamp without time zone DEFAULT now(),
  CONSTRAINT routines_pkey PRIMARY KEY (id),
  CONSTRAINT workouts_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.trainee_routine (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trainee_id uuid NOT NULL,

---

## 🔧 Sistema y Logs

### `user_trigger_log`
Logs de eventos de triggers de base de datos para debugging y auditoría.

---

## 👤 Perfil de Usuario

### `users`
Tabla principal de usuarios de la aplicación (extiende auth.users de Supabase).

- **role**: 'entrenador' | 'alumno'
- **account_privacy**: 'public' | 'private' - Para control de visibilidad


  routine_id uuid NOT NULL,
  assigned_on timestamp without time zone DEFAULT now(),
  display_order integer DEFAULT 0,
  CONSTRAINT trainee_routine_pkey PRIMARY KEY (id),
  CONSTRAINT trainee_workout_trainee_id_fkey FOREIGN KEY (trainee_id) REFERENCES public.users(id),
  CONSTRAINT trainee_workout_workout_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id)
);
CREATE TABLE public.trainer_link_request (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  student_id uuid NOT NULL,
  message text,

---

## 🏋️‍♂️ Sesiones de Entrenamiento (Workout Sessions)

### `workout_session`
Registro de entrenamientos completados o en progreso.

- **routine_id**: Opcional - puede ser un workout libre o basado en una rutina
- **routine_name, routine_owner_id, routine_owner_name**: Datos desnormalizados para mantener historial
- **visibility**: Control de privacidad del workout
- **is_published_to_feed**: Si se comparte en el feed social

### `workout_session_media`
Media (fotos/videos) asociada a una sesión de entrenamiento. Utiliza Cloudflare R2 para almacenamiento.

- **r2_key**: Ruta en Cloudflare R2 (NO URLs públicas)
- **sort_index**: Orden de las imágenes en la galería

### `workout_set_log`
Log de cada set individual realizado durante una sesión.

- **block_exercise_id, block_exercise_set_id**: Referencias opcionales a la rutina base
- **exercise_order_index**: Orden en que se realizó el ejercicio

  status USER-DEFINED NOT NULL DEFAULT 'pending'::request_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  decided_at timestamp with time zone,
  requested_by USER-DEFINED NOT NULL,
  CONSTRAINT trainer_link_request_pkey PRIMARY KEY (id),
  CONSTRAINT trainer_link_request_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES auth.users(id),
  CONSTRAINT trainer_link_request_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id)
);
CREATE TABLE public.trainer_student (
  trainer_id uuid NOT NULL,
  student_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text])),
  CONSTRAINT trainer_student_pkey PRIMARY KEY (id),
  CONSTRAINT trainer_student_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES auth.users(id),
  CONSTRAINT trainer_student_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_follow (
  follower_id uuid NOT NULL,
  followed_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_follow_pkey PRIMARY KEY (follower_id, followed_id),
  CONSTRAINT user_follow_follower_fkey FOREIGN KEY (follower_id) REFERENCES auth.users(id),
  CONSTRAINT user_follow_followed_fkey FOREIGN KEY (followed_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_trigger_log (
  id bigint NOT NULL DEFAULT nextval('user_trigger_log_id_seq'::regclass),
  

---

## 📝 Notas Importantes

### Arquitectura de Almacenamiento (Media)
- **NO** se almacenan URLs públicas en la base de datos
- Se almacena **r2_key** que es la ruta en Cloudflare R2
- El backend genera Signed URLs temporales (60s) cuando se necesitan
- Convención de claves: `users/{USER_ID}/workouts/{SESSION_ID}/{UUID}.{ext}`

### Sistema de Rutinas V2
- El sistema actual usa una arquitectura normalizada para máxima flexibilidad
- Cada set puede tener configuración diferente (peso, reps, descanso)
- Los bloques permiten organización lógica de ejercicios
- Soporte para supersets mediante `superset_group`

### Políticas RLS (Row Level Security)
- Todas las tablas tienen RLS habilitado en Supabase
- Los usuarios solo pueden ver sus propios datos
- Los entrenadores pueden ver datos de sus estudiantes
- Las políticas específicas están configuradas en Supabase

---

**Última actualización**: 13 de febrero de 2026created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  msg text,
  CONSTRAINT user_trigger_log_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  name text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'alumno'::role,
  avatar_url text,
  created_on timestamp without time zone NOT NULL DEFAULT now(),
  account_privacy text NOT NULL DEFAULT 'public'::text CHECK (account_privacy = ANY (ARRAY['public'::text, 'private'::text])),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.workout_session (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  performer_id uuid NOT NULL,
  routine_id uuid,
  routine_name text,
  routine_owner_id uuid,
  routine_owner_name text,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  notes text,
  visibility text NOT NULL DEFAULT 'private'::text CHECK (visibility = ANY (ARRAY['private'::text, 'followers'::text, 'public'::text])),
  title text,
  description text,
  cover_image_path text,
  is_published_to_feed boolean NOT NULL DEFAULT false,
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  media_count integer NOT NULL DEFAULT 0,
  CONSTRAINT workout_session_pkey PRIMARY KEY (id),
  CONSTRAINT workout_session_v2_performer_id_fkey FOREIGN KEY (performer_id) REFERENCES public.users(id),
  CONSTRAINT workout_session_v2_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id)
);
CREATE TABLE public.workout_session_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  r2_key text NOT NULL,
  mime_type text,
  byte_size integer CHECK (byte_size IS NULL OR byte_size >= 0),
  sort_index integer NOT NULL DEFAULT 1 CHECK (sort_index >= 1),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  media_type text NOT NULL DEFAULT 'image'::text CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text])),
  CONSTRAINT workout_session_media_pkey PRIMARY KEY (id),
  CONSTRAINT workout_session_media_session_fkey FOREIGN KEY (session_id) REFERENCES public.workout_session(id)
);
CREATE TABLE public.workout_set_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  block_exercise_id uuid,
  block_exercise_set_id uuid,
  exercise_id text NOT NULL,
  set_index integer NOT NULL DEFAULT 1 CHECK (set_index >= 1),
  reps integer,
  weight_kg numeric CHECK (weight_kg IS NULL OR weight_kg >= 0::numeric),
  rpe numeric,
  duration_sec integer CHECK (duration_sec IS NULL OR duration_sec >= 0),
  rest_seconds integer CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
  notes text,
  performed_at timestamp with time zone NOT NULL DEFAULT now(),
  exercise_order_index integer,
  CONSTRAINT workout_set_log_pkey PRIMARY KEY (id),
  CONSTRAINT workout_set_log_v2_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.workout_session(id),
  CONSTRAINT workout_set_log_v2_block_exercise_id_fkey FOREIGN KEY (block_exercise_id) REFERENCES public.block_exercise(id),
  CONSTRAINT workout_set_log_v2_block_exercise_set_id_fkey FOREIGN KEY (block_exercise_set_id) REFERENCES public.block_exercise_set(id),
  CONSTRAINT workout_set_log_v2_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);