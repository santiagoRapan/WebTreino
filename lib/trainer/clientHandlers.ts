import { toast } from "@/hooks/use-toast"
import type { Client } from "@/types/trainer"

export interface ClientHandlers {
  handleEditClient: (client: Client) => void
  handleDeleteClient: (clientId: number) => void
  handleMarkAsActive: (clientId: number) => void
  handleViewHistory: (clientId: number) => void
  handleNewClient: () => void
  handleScheduleSession: (clientId: number) => void
  handleViewAllClients: () => void
  handleChatFromClient: (clientId: number) => void
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

    handleViewHistory: (clientId: number) => {
      const client = clientState.clients.find((c: Client) => c.id === clientId)
      if (client) {
        toast({
          title: "Historial de cliente",
          description: `Mostrando historial de ${client.name}`,
        })
      }
    },

    handleNewClient: () => {
      // Navigate to clients tab first, then open the dialog
      uiState.setActiveTab("clients")
      // Use setTimeout to ensure the tab change is processed first
      setTimeout(() => {
        uiState.setIsNewClientDialogOpen(true)
      }, 100)
    },

    handleScheduleSession: (clientId: number) => {
      const client = clientState.clients.find((c: Client) => c.id === clientId)
      if (client) {
        uiState.setIsAddEventDialogOpen(true)
        // Pre-fill event form with client data
        toast({
          title: "Programar sesión",
          description: `Programando sesión para ${client.name}`,
        })
      }
    },

    handleViewAllClients: () => {
      uiState.setActiveTab("clients")
    },

    handleChatFromClient: (clientId: number) => {
      const client = clientState.clients.find((c: Client) => c.id === clientId)
      if (client) {
        uiState.setActiveTab("chat")
        // Logic to select or create chat with this client would go here
        toast({
          title: "Chat iniciado",
          description: `Iniciando chat con ${client.name}`,
        })
      }
    },
  }
}