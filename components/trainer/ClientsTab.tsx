"use client"

import { useTrainerDashboard } from "@/components/trainer/TrainerDashboardContext"
import { Card, CardContent } from "@/components/ui/card"
import { ClientsHeader } from "./clients/ClientsHeader"
import { ClientFilters } from "./clients/ClientFilters"
import { ClientTable } from "./clients/ClientTable"
import { EditClientDialog } from "./clients/EditClientDialog"
import { NewClientDialog } from "./clients/NewClientDialog"
import { ClientHistoryDialog } from "./clients/ClientHistoryDialog"

export function ClientsTab() {
  const {
    state,
    data,
    actions,
  } = useTrainerDashboard()

  return (
    <>
      <main className="p-6 space-y-6">
        <ClientsHeader onNewClient={actions.handleNewClient} />
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
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
              onViewHistory={actions.openStudentHistory}
            />
          </CardContent>
        </Card>
      </main>

      <EditClientDialog
        isOpen={state.isEditDialogOpen}
        onClose={() => actions.setIsEditDialogOpen(false)}
        client={state.editingClient}
        onClientUpdate={actions.setEditingClient}
      />

      <NewClientDialog
        isOpen={state.isNewClientDialogOpen}
        onClose={() => actions.setIsNewClientDialogOpen(false)}
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
