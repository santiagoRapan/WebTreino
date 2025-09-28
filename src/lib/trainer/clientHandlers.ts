import { toast } from "@/hooks/use-toast"
import { supabase } from "@/services/database"
import type { Client } from "@/lib/types/trainer"

export interface ClientHandlers {
  handleEditClient: (client: Client) => void
  handleDeleteClient: (clientId: number) => void
  handleMarkAsActive: (clientId: number) => void
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

    handleDeleteClient: (clientId: number) => {
      const updatedClients = clientState.clients.filter((c: Client) => c.id !== clientId)
      clientState.setClients(updatedClients)
      
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente.",
      })
    },

    handleMarkAsActive: (clientId: number) => {
      const updatedClients = clientState.clients.map((client: Client) =>
        client.id === clientId ? { ...client, status: "Activo" as const } : client
      )
      clientState.setClients(updatedClients)
      
      toast({
        title: "Estado actualizado",
        description: "El cliente ha sido marcado como activo.",
      })
    },

    handleNewClient: () => {
      // Navigate to clients tab first, then open the dialog
      uiState.setActiveTab("clients")
      // Use setTimeout to ensure the tab change is processed first
      setTimeout(() => {
        uiState.setIsNewClientDialogOpen(true)
      }, 100)
    },

    handleViewAllClients: () => {
      uiState.setActiveTab("clients")
    },

    // chat handler removed

    // Requests management
    acceptLinkRequest: async (client: Client) => {
      if (client.requestedBy === 'entrenador') {
        toast({ title: 'Acción no permitida', description: 'Solo el alumno puede aceptar una invitación enviada por el entrenador.', variant: 'destructive' })
        return
      }
      if (!client.requestId) return
      const { error } = await supabase
        .from('trainer_link_request')
        .update({ status: 'accepted', decided_at: new Date().toISOString() })
        .eq('id', client.requestId)
        .eq('status', 'pending')

      if (error) {
        console.error('❌ acceptLinkRequest error:', error)
        const isUnique = (error as any)?.code === '23505' || `${error.message}`.includes('uq_open_pair') || `${error.details}`.includes('uq_open_pair')
        if (isUnique) {
          toast({ title: 'Ya aceptada', description: 'Esta relación ya existe. Actualizando la lista...', variant: 'default' })
          await clientState.refreshClients()
        } else {
          toast({ title: 'Error', description: `No se pudo aceptar la solicitud: ${error.message}`, variant: 'destructive' })
        }
        return
      }

      // Trigger will insert into trainer_student. Refresh list.
      await clientState.refreshClients()
      toast({ title: 'Solicitud aceptada', description: `${client.name} añadido a tu roster` })
    },

    rejectLinkRequest: async (client: Client) => {
      if (client.requestedBy === 'entrenador') {
        toast({ title: 'Acción no permitida', description: 'Solo el alumno puede rechazar una invitación enviada por el entrenador.', variant: 'destructive' })
        return
      }
      if (!client.requestId) return
      const { error } = await supabase
        .from('trainer_link_request')
        .update({ status: 'rejected', decided_at: new Date().toISOString() })
        .eq('id', client.requestId)
        .eq('status', 'pending')

      if (error) {
        console.error('❌ rejectLinkRequest error:', error)
        toast({ title: 'Error', description: `No se pudo rechazar la solicitud: ${error.message}`, variant: 'destructive' })
        return
      }
      await clientState.refreshClients()
      toast({ title: 'Solicitud rechazada', description: `Has rechazado la solicitud de ${client.name}` })
    },

    cancelLinkRequest: async (client: Client) => {
      if (client.requestedBy === 'alumno') {
        toast({ title: 'Acción no permitida', description: 'Solo el alumno puede cancelar una solicitud que él inició.', variant: 'destructive' })
        return
      }
      if (!client.requestId) return
      const { error } = await supabase
        .from('trainer_link_request')
        .update({ status: 'canceled', decided_at: new Date().toISOString() })
        .eq('id', client.requestId)
        .eq('status', 'pending')

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