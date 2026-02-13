"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import { guestService } from "@/features/students/services/guest-service"
import { updateCustomUser } from "@/services/auth"
import type { Client } from "../types"

interface EditClientDialogProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  onClientUpdate: (client: Client) => void
}

export function EditClientDialog({
  isOpen,
  onClose,
  client,
  onClientUpdate,
}: EditClientDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!client) return
    setLoading(true)
    try {
      if (client.isGuest) {
        // Update guest user (email and phone are editable)
        await guestService.updateGuest(client.id, {
          name: client.name,
          email: client.email,
          phone: client.phone,
        })
      } else {
        // Update registered user (only name is editable via public.users)
        const result = await updateCustomUser(client.userId, {
          name: client.name,
        })
        
        if (result.error) {
          throw new Error('Failed to update user profile')
        }
      }

      toast({ title: "Datos actualizados correctamente" })
      onClose()
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Editar información del alumno</DialogTitle>
          <DialogDescription>Actualiza los datos y guarda los cambios.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="edit-name"
              value={client.name || ""}
              onChange={(e) => onClientUpdate({ ...client, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          {client.isGuest && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  value={client.email || ""}
                  onChange={(e) => onClientUpdate({ ...client, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="edit-phone"
                  value={client.phone || ""}
                  onChange={(e) => onClientUpdate({ ...client, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
