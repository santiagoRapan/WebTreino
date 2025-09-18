"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "@/hooks/use-toast"
import type { Client } from "@/types/trainer"

export interface UseStudentsReturn {
  students: Client[]
  loading: boolean
  error: string | null
  refreshStudents: () => Promise<void>
}

export function useStudents(): UseStudentsReturn {
  const [students, setStudents] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('📚 Loading students from database...')

      // Fetch users with role 'alumno'
      const { data: studentsData, error: studentsError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'alumno')
        .order('created_on', { ascending: false })

      if (studentsError) {
        console.error('❌ Error loading students:', studentsError)
        setError(studentsError.message)
        return
      }

      console.log('✅ Students loaded:', studentsData?.length || 0)

      // Transform database users to Client format
      const transformedStudents: Client[] = (studentsData || []).map((student: any) => ({
        id: student.id,
        name: student.name,
        email: student.email || '',
        phone: student.phone || '',
        status: "Activo" as const, // Default status
        joinDate: new Date(student.created_on).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short', 
          year: 'numeric'
        }),
        lastSession: "N/A",
        nextSession: "N/A", 
        progress: 0,
        goal: "Sin definir",
        avatar: student.avatar_url || "/placeholder-user.jpg",
        sessionsCompleted: 0,
        totalSessions: 0,
        plan: "Básico"
      }))

      setStudents(transformedStudents)

    } catch (err) {
      console.error('❌ Error fetching students:', err)
      setError('Error al cargar los alumnos')
      toast({
        title: "Error",
        description: "No se pudieron cargar los alumnos.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshStudents = async () => {
    await fetchStudents()
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return {
    students,
    loading,
    error,
    refreshStudents
  }
}