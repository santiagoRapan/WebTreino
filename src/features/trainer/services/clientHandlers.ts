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
        const { error, count } = await supabase
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

      const now = new Date().toISOString()

      const { error } = await supabase
        .from('trainer_link_request')
        .update({ status: 'accepted', decided_at: now })
        .eq('id', client.requestId)

      if (error) {
        console.error('acceptLinkRequest error:', error)
        toast({ title: 'Error', description: `No se pudo aceptar la solicitud: ${error.message}`, variant: 'destructive' })
        return
      }

      await clientState.refreshClients()
      toast({ title: 'Solicitud aceptada', description: `${client.name} añadido a tu roster` })
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
