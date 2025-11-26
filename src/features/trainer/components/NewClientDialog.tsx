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
import { useState } from "react"
import { guestService } from "@/features/students/services/guest-service"
import { toast } from "@/hooks/use-toast"

interface NewClientDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function NewClientDialog({ isOpen, onClose, onSuccess }: NewClientDialogProps) {
  // Dialog for creating new guests
  const [loading, setLoading] = useState(false)

  // Guest form state
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")

  const handleCreateGuest = async () => {
    if (!guestName) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await guestService.createGuest({
        name: guestName,
        email: guestEmail || undefined,
        phone: guestPhone || undefined
      })

      toast({
        title: "Alumno invitado creado",
        description: "El alumno ha sido registrado correctamente."
      })

      // Reset form
      setGuestName("")
      setGuestEmail("")
      setGuestPhone("")

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error creating guest:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el alumno invitado",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Alumno</DialogTitle>
          <DialogDescription>
            Crea un perfil para un alumno invitado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="guest-name" className="text-right">
              Nombre *
            </Label>
            <Input
              id="guest-name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nombre del alumno"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="guest-email" className="text-right">
              Email
            </Label>
            <Input
              id="guest-email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Opcional"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="guest-phone" className="text-right">
              Teléfono
            </Label>
            <Input
              id="guest-phone"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="Opcional"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleCreateGuest}
            disabled={loading}
            className="hover:bg-orange-500 transition-colors"
          >
            {loading ? "Creando..." : "Crear Invitado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}