import { toast } from "@/hooks/use-toast"
import { supabase } from "@/services/database"
import { getCurrentUser } from "@/features/auth/services/auth"
import type { Client } from "../types"

export interface ClientHandlers {
  handleEditClient: (client: Client) => void
  handleDeleteClient: (clientId: string) => Promise<void>
  handleUpdateStatus: (client: Client, newStatus: "active" | "inactive" | "pending") => Promise<void>
  handleNewClient: () => void
  handleViewAllClients: () => void
  acceptLinkRequest: (client: Client) => Promise<void>
  rejectLinkRequest: (client: Client) => Promise<void>
  cancelLinkRequest: (client: Client) => Promise<void>
  openStudentHistory: (client: Client) => Promise<void>
}

export function createClientHandlers(
  clientState: any,
  uiState: any
): ClientHandlers {
  return {
    handleEditClient: (client: Client) => {
      clientState.setEditingClient(client)
      uiState.setIsEditDialogOpen(true)
    },

    handleDeleteClient: async (clientId: string) => {
      try {
        // Get the current trainer ID from auth
        const authUser = await getCurrentUser()
        if (!authUser?.id) {
          toast({
            title: "Error",
            description: "No se encontró un usuario autenticado.",
            variant: "destructive"
          })
          return
        }
        const trainerId = authUser.id

        // Find the client to get their userId (the actual auth.users id)
        const client = clientState.clients.find((c: Client) => c.id === clientId)
        if (!client) {
          toast({
            title: "Error",
            description: "No se encontró el cliente.",
            variant: "destructive"
          })
          return
        }

        const studentId = client.userId // This is the auth.users id

        // First, check if the relationship exists
        const { data: existingRelationship, error: checkError } = await supabase
          .from('trainer_student')
          .select('id, trainer_id, student_id')
          .eq('trainer_id', trainerId)
          .eq('student_id', studentId)
          .maybeSingle()

        if (checkError) {
          console.error('Error checking existing relationship:', checkError)
          toast({
            title: "Error",
            description: "No se pudo verificar la relación existente.",
            variant: "destructive"
          })
          return
        }

        if (!existingRelationship) {
          console.warn('No trainer_student relationship found for:', { trainerId, studentId })
          toast({
            title: "Relación no encontrada",
            description: "No se encontró una relación activa con este cliente.",
            variant: "destructive"
          })
          return
        }

        // Delete the trainer_student relationship from Supabase
        const { error } = await supabase
          .from('trainer_student')
          .delete()
          .eq('trainer_id', trainerId)
          .eq('student_id', studentId)

        if (error) {
          console.error('Error deleting trainer_student relationship:', error)
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          toast({
            title: "Error",
            description: `No se pudo eliminar la relación: ${error.message}`,
            variant: "destructive"
          })
          return
        }

        // Also clean up any pending or accepted link requests to prevent duplicate constraint errors
        // when the student tries to reconnect in the future
        const { error: requestError } = await supabase
          .from('trainer_link_request')
          .delete()
          .eq('trainer_id', trainerId)
          .eq('student_id', studentId)
          .in('status', ['pending', 'accepted'])
        
        if (requestError) {
          console.warn('Error cleaning up link requests (non-critical):', requestError)
          // Don't block the operation - this is just cleanup
        }

        // Remove from local state
        const updatedClients = clientState.clients.filter((c: Client) => c.id !== clientId)
        clientState.setClients(updatedClients)

        toast({
          title: "Cliente eliminado",
          description: "El cliente ha sido eliminado exitosamente.",
        })

      } catch (error) {
        console.error('Unexpected error deleting client:', error)
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado al eliminar el cliente.",
          variant: "destructive"
        })
      }
    },

    handleUpdateStatus: async (client: Client, newStatus: "active" | "inactive" | "pending") => {
      try {
        const authUser = await getCurrentUser()
        if (!authUser?.id) return

        if (client.isGuest) {
          // Update guest status
          const { error } = await supabase
            .from('guests')
            .update({ status: newStatus })
            .eq('id', client.id)
            .eq('trainer_id', authUser.id)

          if (error) throw error
        } else {
          // Update registered student status (trainer_student)
          // Use relationshipId if available, otherwise try to find it
          let relationshipId = client.relationshipId

          if (!relationshipId) {
            const { data } = await supabase
              .from('trainer_student')
              .select('id')
              .eq('trainer_id', authUser.id)
              .eq('student_id', client.userId)
              .single()
            relationshipId = data?.id
          }

          if (!relationshipId) throw new Error("No relationship found")

          const { error } = await supabase
            .from('trainer_student')
            .update({ status: newStatus })
            .eq('id', relationshipId)

          if (error) throw error
        }

        // Optimistic update
        const updatedClients = clientState.clients.map((c: Client) =>
          c.id === client.id ? { ...c, status: newStatus } : c
        )
        clientState.setClients(updatedClients)

        toast({
          title: "Estado actualizado",
          description: `El estado del alumno se ha cambiado a ${newStatus}.`,
        })
      } catch (error) {
        console.error('Error updating status:', error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado.",
          variant: "destructive"
        })
      }
    },

    handleNewClient: () => {
      // Navigate to clients tab and pass action parameter to open dialog
      uiState.setActiveTab("clients")
      window.location.href = "/alumnos?action=newClient"
    },

    handleViewAllClients: () => {
      uiState.setActiveTab("clients")
      window.location.href = "/alumnos"
    },

    // chat handler removed

    // Requests management
    acceptLinkRequest: async (client: Client) => {
      if (!client.requestId) {
        toast({ title: 'Error', description: 'No se pudo identificar la solicitud', variant: 'destructive' })
        return
      }

      try {
        const authUser = await getCurrentUser()
        if (!authUser?.id) {
          toast({ title: 'Error', description: 'No se pudo identificar al usuario actual', variant: 'destructive' })
          return
        }

        const now = new Date().toISOString()

        // First, get the request details to know trainer_id and student_id
        const { data: requestData, error: fetchError } = await supabase
          .from('trainer_link_request')
          .select('trainer_id, student_id, status')
          .eq('id', client.requestId)
          .single()

        if (fetchError || !requestData) {
          console.error('Error fetching request:', fetchError)
          toast({ title: 'Error', description: 'No se pudo encontrar la solicitud', variant: 'destructive' })
          return
        }

        // Check if already accepted
        if (requestData.status === 'accepted') {
          toast({ 
            title: 'Ya aceptada', 
            description: 'Esta solicitud ya fue aceptada previamente. Verificando conexión...', 
            variant: 'default' 
          })
          
          // Check if the trainer_student relationship exists
          const { data: existingRelation } = await supabase
            .from('trainer_student')
            .select('*')
            .eq('trainer_id', requestData.trainer_id)
            .eq('student_id', requestData.student_id)
            .maybeSingle()

          // If it doesn't exist, create it
          if (!existingRelation) {
            await supabase
              .from('trainer_student')
              .insert({
                trainer_id: requestData.trainer_id,
                student_id: requestData.student_id,
                joined_at: now,
                status: 'active'
              })
          }

          await clientState.refreshClients()
          return
        }

        // Update request status to accepted
        const { error: updateError } = await supabase
          .from('trainer_link_request')
          .update({ status: 'accepted', decided_at: now })
          .eq('id', client.requestId)
          .eq('status', 'pending')

        if (updateError) {
          console.error('Error updating request:', updateError)
          toast({ title: 'Error', description: `No se pudo aceptar la solicitud: ${updateError.message}`, variant: 'destructive' })
          return
        }

        // Check if relationship already exists to prevent duplicates
        const { data: checkExisting } = await supabase
          .from('trainer_student')
          .select('id')
          .eq('trainer_id', requestData.trainer_id)
          .eq('student_id', requestData.student_id)
          .maybeSingle()

        if (checkExisting) {
          // Relationship already exists, just show success
          toast({ title: 'Solicitud aceptada', description: `${client.name} añadido a tu roster` })
          await clientState.refreshClients()
          return
        }

        // Create the trainer_student relationship (no trigger exists, so we do it manually)
        const { error: relationError } = await supabase
          .from('trainer_student')
          .insert({
            trainer_id: requestData.trainer_id,
            student_id: requestData.student_id,
            joined_at: now,
            status: 'active'
          })

        if (relationError) {
          console.error('Error creating trainer_student relationship:', relationError)
          
          // Check if it's a duplicate key error (relationship already exists)
          const isDuplicateKey = 
            (relationError as any)?.code === '23505' || 
            `${relationError.message}`.toLowerCase().includes('duplicate key')
          
          if (isDuplicateKey) {
            // Relationship already exists, that's fine - just refresh
            toast({ 
              title: 'Solicitud aceptada', 
              description: `${client.name} añadido a tu roster`, 
            })
          } else {
            // Real error - rollback the request status
            await supabase
              .from('trainer_link_request')
              .update({ status: 'pending' })
              .eq('id', client.requestId)
            
            toast({ 
              title: 'Error', 
              description: `No se pudo crear la relación: ${relationError.message}`, 
              variant: 'destructive' 
            })
            return
          }
        } else {
          toast({ title: 'Solicitud aceptada', description: `${client.name} añadido a tu roster` })
        }

        await clientState.refreshClients()

      } catch (error) {
        console.error('Unexpected error in acceptLinkRequest:', error)
        toast({ 
          title: 'Error', 
          description: 'Ocurrió un error inesperado al aceptar la solicitud', 
          variant: 'destructive' 
        })
      }
    },

    rejectLinkRequest: async (client: Client) => {
      if (!client.requestId) {
        toast({ title: 'Error', description: 'No se pudo identificar la solicitud', variant: 'destructive' })
        return
      }

      const { error } = await supabase
        .from('trainer_link_request')
        .delete()
        .eq('id', client.requestId)

      if (error) {
        console.error('rejectLinkRequest error:', error)
        toast({ title: 'Error', description: `No se pudo rechazar la solicitud: ${error.message}`, variant: 'destructive' })
        return
      }

      await clientState.refreshClients()
      toast({ title: 'Solicitud rechazada', description: `Has rechazado la solicitud de ${client.name}` })
    },

    cancelLinkRequest: async (client: Client) => {
      if (!client.requestId) {
        toast({ title: 'Error', description: 'No se pudo identificar la solicitud', variant: 'destructive' })
        return
      }

      const { error } = await supabase
        .from('trainer_link_request')
        .delete()
        .eq('id', client.requestId)

      if (error) {
        console.error('cancelLinkRequest error:', error)
        toast({ title: 'Error', description: `No se pudo cancelar la solicitud: ${error.message}`, variant: 'destructive' })
        return
      }

      await clientState.refreshClients()
      toast({ title: 'Solicitud cancelada', description: `Has cancelado la solicitud a ${client.name}` })
    },

    openStudentHistory: async (client: Client) => {
      if (!client.userId) {
        toast({ title: 'Sin datos', description: 'No se pudo identificar al alumno.' })
        return
      }
      // Set client and open dialog immediately for better UX
      clientState.setEditingClient(client)
      uiState.setIsHistoryDialogOpen(true)
      // Clear old data while new data is loading
      clientState.setHistorySessions([])
      clientState.setHistoryLogs([])

      const { sessions, logs } = await clientState.fetchStudentSessions(client.userId)

      clientState.setHistorySessions(sessions)
      clientState.setHistoryLogs(logs)

      if (sessions.length > 0) {
        toast({ title: 'Historial cargado', description: `${sessions.length} sesiones encontradas.` })
      } else {
        toast({ title: 'Historial', description: `No se encontraron sesiones.` })
      }
    },
  }
}
