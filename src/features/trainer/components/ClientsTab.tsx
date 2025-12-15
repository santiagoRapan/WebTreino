"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { Card, CardContent } from "@/components/ui/card"
import { ClientsHeader } from "./ClientsHeader"
import { ClientFilters } from "./ClientFilters"
import { ClientTable } from "./ClientTable"
import { EditClientDialog } from "./EditClientDialog"
import { NewClientDialog } from "./NewClientDialog"
import { ClientHistoryDialog } from "./ClientHistoryDialog"

export function ClientsTab() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    state,
    data,
    actions,
  } = useTrainerDashboard()

  // Check for action parameter to open new client dialog
  useEffect(() => {
    if (searchParams.get('action') === 'newClient') {
      actions.setIsNewClientDialogOpen(true)
      // Clean up URL parameter
      router.replace('/alumnos', { scroll: false })
    }
  }, [searchParams, actions, router])

  return (
    <>
      <main className="p-4 md:p-6 space-y-4 md:space-y-6">
        <ClientsHeader onNewClient={actions.handleNewClient} />

        <Card className="bg-card border-border">
          <CardContent className="p-3 md:p-4">
            <ClientFilters
              searchTerm={state.searchTerm}
              setSearchTerm={actions.setSearchTerm}
              clientFilter={state.clientFilter}
              setClientFilter={actions.setClientFilter}
              allClients={data.allClients}
            />

            <ClientTable
              clients={data.filteredClients}
              //onChatWithClient={actions.handleChatFromClient}
              onEditClient={actions.handleEditClient}
              onDeleteClient={actions.handleDeleteClient}
              onAcceptRequest={actions.acceptLinkRequest}
              onRejectRequest={actions.rejectLinkRequest}
              onCancelRequest={actions.cancelLinkRequest}
              onViewHistory={(client) => router.push(`/alumnos/${encodeURIComponent(client.userId)}/historial`)}
              onUpdateStatus={actions.handleUpdateStatus}
            />
          </CardContent>
        </Card>
      </main>

      <EditClientDialog
        isOpen={state.isEditDialogOpen}
        onClose={() => actions.setIsEditDialogOpen(false)}
        client={state.editingClient}
        onClientUpdate={actions.setEditingClient}
        onUpdateStatus={actions.handleUpdateStatus}
      />

      <NewClientDialog
        isOpen={state.isNewClientDialogOpen}
        onClose={() => actions.setIsNewClientDialogOpen(false)}
        onSuccess={actions.refreshClients}
      />

      <ClientHistoryDialog
        isOpen={state.isHistoryDialogOpen}
        onClose={() => actions.setIsHistoryDialogOpen(false)}
        client={state.editingClient}
        sessions={state.historySessions}
        logs={state.historyLogs}
      />
    </>
  )
}
