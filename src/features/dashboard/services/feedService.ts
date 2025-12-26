import { supabase } from "@/services/database/supabaseClient"

export interface FeedWorkoutSession {
  id: string
  started_at: string
  completed_at: string | null
  title: string | null
  description: string | null
  notes: string | null
  routine: {
    name: string
    description: string | null
  } | null
  performer: {
    name: string
    avatar_url: string | null
  }
  media: {
    storage_path: string
    media_type: 'image' | 'video'
    public_url: string
  }[]
  stats: {
    exerciseCount: number
    setCount: number
    duration: string
  }
}

export interface SessionExerciseDetail {
  exerciseId: string
  name: string
  gifUrl: string | null
  note: string | null
  sets: {
    id: string
    setIndex: number
    weight: number | null
    reps: number | null
    rpe: number | null
  }[]
}

export async function getSessionDetails(sessionId: string): Promise<SessionExerciseDetail[]> {
  const { data, error } = await supabase
    .from('workout_set_log')
    .select(`
      id,
      set_index,
      reps,
      weight_kg,
      rpe,
      notes,
      performed_at,
      exercise:exercises (
        id,
        name,
        "gif_URL"
      )
    `)
    .eq('session_id', sessionId)
    .order('performed_at', { ascending: true })

  if (error) throw error

  // Group by exercise preserving order of first appearance
  const grouped = new Map<string, SessionExerciseDetail>()
  
  data.forEach((log: any) => {
    const exerciseId = log.exercise.id
    if (!grouped.has(exerciseId)) {
      grouped.set(exerciseId, {
        exerciseId,
        name: log.exercise.name,
        gifUrl: log.exercise.gif_URL, // Supabase returns it as gif_URL usually, or we might need to check casing
        note: null,
        sets: []
      })
    }

    const existing = grouped.get(exerciseId)!
    const candidateNote = typeof log.notes === 'string' ? log.notes.trim() : ''
    if (!existing.note && candidateNote) {
      existing.note = candidateNote
    }
    
    existing.sets.push({
      id: log.id,
      setIndex: log.set_index,
      weight: log.weight_kg,
      reps: log.reps,
      rpe: log.rpe,
    })
  })

  return Array.from(grouped.values())
}

export async function getStudentWorkouts(trainerId: string): Promise<FeedWorkoutSession[]> {
  // 1. Get all students for this trainer
  const { data: students, error: studentsError } = await supabase
    .from('trainer_student')
    .select('student_id')
    .eq('trainer_id', trainerId)

  if (studentsError) throw studentsError
  if (!students || students.length === 0) return []

  const studentIds = students.map((s: { student_id: string }) => s.student_id)

  // 2. Get sessions for these students
  // Note: We fetch performer details separately because there might not be a direct FK to public.users
  const { data: sessions, error: sessionsError } = await supabase
    .from('workout_session')
    .select(`
      id,
      performer_id,
      started_at,
      completed_at,
      duration_seconds,
      title,
      description,
      notes,
      routine:routines (
        name,
        description
      ),
      media:workout_session_media (
        storage_path,
        media_type,
        mime_type
      ),
      logs:workout_set_log (
        exercise_id
      )
    `)
    .in('performer_id', studentIds)
    .order('completed_at', { ascending: false })
    .limit(20)

  if (sessionsError) {
    console.error("Error fetching sessions:", JSON.stringify(sessionsError, null, 2))
    throw sessionsError
  }

  if (!sessions || sessions.length === 0) return []

  // 3. Fetch performer details
  const performerIds = [...new Set(sessions.map((s: any) => s.performer_id))]
  const { data: performers, error: performersError } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .in('id', performerIds)

  if (performersError) {
    console.error("Error fetching performers:", JSON.stringify(performersError, null, 2))
    // We continue even if performer fetch fails, just showing unknown user
  }

  const performersMap = new Map(performers?.map((p: any) => [p.id, p]) || [])

  // 4. Transform data
  const transformedSessions = await Promise.all(sessions.map(async (session: any) => {
    let durationSeconds = 0
    if (session.duration_seconds) {
      durationSeconds = session.duration_seconds
    } else {
      const durationMs = session.completed_at 
        ? new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()
        : 0
      durationSeconds = Math.floor(durationMs / 1000)
    }

    const minutes = Math.floor(durationSeconds / 60)
    const seconds = durationSeconds % 60
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`

    // Count unique exercises
    const uniqueExercises = new Set(session.logs.map((l: any) => l.exercise_id)).size
    const setCount = session.logs.length

    const performer = performersMap.get(session.performer_id)

    // Generate signed URLs for media (since bucket is private)
    const mediaWithUrls = await Promise.all((session.media || []).map(async (item: any) => {
      try {
        const { data, error } = await supabase.storage
          .from('workout-images')
          .createSignedUrl(item.storage_path, 3600) // 1 hour expiry

        if (error) {
          console.error("Error creating signed URL:", error)
          return { ...item, public_url: null }
        }

        // Determine if video based on mime_type or media_type
        const isVideo = item.mime_type?.startsWith('video/') || item.media_type === 'video'

        return {
          ...item,
          media_type: isVideo ? 'video' : 'image',
          public_url: data.signedUrl
        }
      } catch (err) {
        console.error("Exception creating signed URL:", err)
        return { ...item, public_url: null }
      }
    }))

    return {
      id: session.id,
      started_at: session.started_at,
      completed_at: session.completed_at,
      title: session.title,
      description: session.description,
      notes: session.notes,
      routine: session.routine,
      performer: {
        name: performer?.name || 'Usuario desconocido',
        avatar_url: performer?.avatar_url || null
      },
      media: mediaWithUrls.filter((m: any) => m.public_url !== null),
      stats: {
        exerciseCount: uniqueExercises,
        setCount: setCount,
        duration: formattedDuration
      }
    }
  }))

  return transformedSessions
}

export async function getWorkoutsForStudent(trainerId: string, studentId: string): Promise<FeedWorkoutSession[]> {
  // Ensure this student belongs to the trainer (avoid leaking data if RLS is permissive)
  const { data: rel, error: relErr } = await supabase
    .from('trainer_student')
    .select('id')
    .eq('trainer_id', trainerId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (relErr) throw relErr
  if (!rel) return []

  const { data: sessions, error: sessionsError } = await supabase
    .from('workout_session')
    .select(`
      id,
      performer_id,
      started_at,
      completed_at,
      duration_seconds,
      title,
      description,
      notes,
      routine:routines (
        name,
        description
      ),
      media:workout_session_media (
        storage_path,
        media_type,
        mime_type
      ),
      logs:workout_set_log (
        exercise_id
      )
    `)
    .eq('performer_id', studentId)
    .order('completed_at', { ascending: false })

  if (sessionsError) {
    console.error("Error fetching sessions:", JSON.stringify(sessionsError, null, 2))
    throw sessionsError
  }

  if (!sessions || sessions.length === 0) return []

  const { data: performer, error: performerError } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .eq('id', studentId)
    .maybeSingle()

  if (performerError) {
    console.error("Error fetching performer:", JSON.stringify(performerError, null, 2))
  }

  const transformedSessions = await Promise.all(sessions.map(async (session: any) => {
    let durationSeconds = 0
    if (session.duration_seconds) {
      durationSeconds = session.duration_seconds
    } else {
      const durationMs = session.completed_at
        ? new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()
        : 0
      durationSeconds = Math.floor(durationMs / 1000)
    }

    const minutes = Math.floor(durationSeconds / 60)
    const seconds = durationSeconds % 60
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`

    const uniqueExercises = new Set((session.logs || []).map((l: any) => l.exercise_id)).size
    const setCount = (session.logs || []).length

    const mediaWithUrls = await Promise.all((session.media || []).map(async (item: any) => {
      try {
        const { data, error } = await supabase.storage
          .from('workout-images')
          .createSignedUrl(item.storage_path, 3600)

        if (error) {
          console.error("Error creating signed URL:", error)
          return { ...item, public_url: null }
        }

        const isVideo = item.mime_type?.startsWith('video/') || item.media_type === 'video'
        return {
          ...item,
          media_type: isVideo ? 'video' : 'image',
          public_url: data.signedUrl
        }
      } catch (err) {
        console.error("Exception creating signed URL:", err)
        return { ...item, public_url: null }
      }
    }))

    return {
      id: session.id,
      started_at: session.started_at,
      completed_at: session.completed_at,
      title: session.title,
      description: session.description,
      notes: session.notes,
      routine: session.routine,
      performer: {
        name: performer?.name || 'Usuario desconocido',
        avatar_url: performer?.avatar_url || null
      },
      media: mediaWithUrls.filter((m: any) => m.public_url !== null),
      stats: {
        exerciseCount: uniqueExercises,
        setCount,
        duration: formattedDuration
      }
    }
  }))

  return transformedSessions
}
