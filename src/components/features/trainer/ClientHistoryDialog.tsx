"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Client } from "@/lib/types/trainer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ClientHistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  sessions: any[]
  logs: any[]
}

export function ClientHistoryDialog({ isOpen, onClose, client, sessions, logs }: ClientHistoryDialogProps) {
  console.log("ClientHistoryDialog received sessions:", sessions);
  console.log("ClientHistoryDialog received logs:", logs);
  
  if (!client) return null

  const getLogsForSession = (sessionId: string) => {
    return logs.filter(log => log.session_id === sessionId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historial de {client.name}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto pr-4">
          {sessions.length === 0 ? (
            <p className="text-muted-foreground py-4">No se encontraron sesiones de entrenamiento para este alumno con rutinas de este entrenador.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {sessions.map(session => (
                <AccordionItem value={session.id} key={session.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span>{new Date(session.started_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <Badge variant="outline">{session.routines.name}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {getLogsForSession(session.id).length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ejercicio</TableHead>
                            <TableHead>Set</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Peso</TableHead>
                            <TableHead>RPE</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getLogsForSession(session.id).map(log => (
                            <TableRow key={log.id}>
                              <TableCell>{log.exercise_name}</TableCell>
                              <TableCell>{log.set_index}</TableCell>
                              <TableCell>{log.reps}</TableCell>
                              <TableCell>{log.weight ? `${log.weight} kg` : '-'}</TableCell>
                              <TableCell>{log.rpe}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground p-4">No hay sets registrados para esta sesión.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
