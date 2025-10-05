"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { Card, CardContent } from "@/components/ui/card"
import { ClientsHeader } from "./ClientsHeader"
import { ClientFilters } from "./ClientFilters"
import { ClientTable } from "./ClientTable"
import { EditClientDialog } from "./EditClientDialog"
import { NewClientDialog } from "./NewClientDialog"
import { ClientHistoryDialog } from "./ClientHistoryDialog"

interface ClientsTabProps {
  action?: string | null
}

export function ClientsTab({ action }: ClientsTabProps) {
  const router = useRouter()
  const {
    state,
    data,
    actions,
  } = useTrainerDashboard()

  const [actionProcessed, setActionProcessed] = useState(false)

  // Handle action parameter to open specific dialogs
  useEffect(() => {
    if (action === 'new' && !actionProcessed) {
      // Open the new client dialog when accessed via URL parameter, but only once
      setActionProcessed(true)
      actions.setIsNewClientDialogOpen(true)
      // Clear the URL parameter to prevent reopening
      router.replace('/alumnos', { scroll: false })
    }
  }, [action, actionProcessed, actions, router])

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
