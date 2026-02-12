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
  uiState: any,
  router?: any
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
      if (router) {
        // Navigate to dedicated clients page and open the dialog via URL search params
        router.push('/alumnos?action=new')
      } else {
        // Fallback to tab-based navigation if no router provided
        uiState.setActiveTab("clients")
        setTimeout(() => {
          uiState.setIsNewClientDialogOpen(true)
        }, 100)
      }
    },

    handleViewAllClients: () => {
      if (router) {
        // Navigate to dedicated clients page
        router.push('/alumnos')
      } else {
        // Fallback to tab-based navigation
        uiState.setActiveTab("clients")
      }
    },

    // chat handler removed

    // Requests management
    acceptLinkRequest: async (client: Client) => {
      if (client.requestedBy === 'entrenador') {
        toast({ title: 'Acción no permitida', description: 'Solo el alumno puede aceptar una invitación enviada por el entrenador.', variant: 'destructive' })
        return
      }
      if (!client.requestId) return

      try {
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
            const now = new Date().toISOString()
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
        const { error } = await supabase
          .from('trainer_link_request')
          .update({ status: 'accepted', decided_at: new Date().toISOString() })
          .eq('id', client.requestId)
          .eq('status', 'pending')

        if (error) {
          console.error('acceptLinkRequest error:', error)
          toast({ title: 'Error', description: `No se pudo aceptar la solicitud: ${error.message}`, variant: 'destructive' })
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
        const now = new Date().toISOString()
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
            // Relationship already exists, that's fine
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
          description: 'Ocurrió un error inesperado', 
          variant: 'destructive' 
        })
      }
    },

    rejectLinkRequest: async (client: Client) => {
      if (client.requestedBy === 'entrenador') {
        toast({ title: 'Acción no permitida', description: 'Solo el alumno puede rechazar una invitación enviada por el entrenador.', variant: 'destructive' })
        return
      }
      if (!client.requestId) return
      
      // Delete the request entirely when rejecting to avoid constraint violations
      const { error } = await supabase
        .from('trainer_link_request')
        .delete()
        .eq('id', client.requestId)
        .eq('status', 'pending')

      if (error) {
        console.error('rejectLinkRequest error:', error)
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
      
      // Delete the request entirely when cancelling to avoid constraint violations
      const { error } = await supabase
        .from('trainer_link_request')
        .delete()
        .eq('id', client.requestId)
        .eq('status', 'pending')

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