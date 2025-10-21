import { toast } from "@/hooks/use-toast"
import { supabase } from "@/services/database"
import { getCurrentUser } from "@/features/auth/services/auth"
import type { Client } from "../types"

export interface ClientHandlers {
  handleEditClient: (client: Client) => void
  handleDeleteClient: (clientId: string) => Promise<void>
  handleMarkAsActive: (clientId: string) => void
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

        // Debug: Log the values being used
        console.log('🗑️ Deleting trainer_student relationship:', {
          trainerId,
          clientId,
          studentId,
          trainerIdType: typeof trainerId,
          clientIdType: typeof clientId,
          studentIdType: typeof studentId
        })

        // First, check if the relationship exists
        const { data: existingRelationship, error: checkError } = await supabase
          .from('trainer_student')
          .select('id, trainer_id, student_id')
          .eq('trainer_id', trainerId)
          .eq('student_id', studentId)
          .maybeSingle()

        if (checkError) {
          console.error('❌ Error checking existing relationship:', checkError)
          toast({
            title: "Error",
            description: "No se pudo verificar la relación existente.",
            variant: "destructive"
          })
          return
        }

        if (!existingRelationship) {
          console.warn('⚠️ No trainer_student relationship found for:', { trainerId, studentId })
          toast({
            title: "Relación no encontrada",
            description: "No se encontró una relación activa con este cliente.",
            variant: "destructive"
          })
          return
        }

        console.log('✅ Found existing relationship:', existingRelationship)

        // Delete the trainer_student relationship from Supabase
        const { error, count } = await supabase
          .from('trainer_student')
          .delete()
          .eq('trainer_id', trainerId)
          .eq('student_id', studentId)

        if (error) {
          console.error('❌ Error deleting trainer_student relationship:', error)
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

        console.log('✅ Successfully deleted relationship. Rows affected:', count)

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

    handleMarkAsActive: (clientId: string) => {
      const updatedClients = clientState.clients.map((client: Client) =>
        client.id === clientId ? { ...client, status: "active" as const } : client
      )
      clientState.setClients(updatedClients)
      
      toast({
        title: "Estado actualizado",
        description: "El cliente ha sido marcado como activo.",
      })
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
        console.error('❌ acceptLinkRequest error:', error)
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
        console.error('❌ rejectLinkRequest error:', error)
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
        console.error('❌ cancelLinkRequest error:', error)
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
      
      console.log("Fetched Sessions:", sessions);
      console.log("Fetched Logs:", logs);

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
