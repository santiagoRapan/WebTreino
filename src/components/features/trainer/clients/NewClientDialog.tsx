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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewClientDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function NewClientDialog({ isOpen, onClose }: NewClientDialogProps) {
  const handleSave = () => {
    alert("Alumno agregado correctamente (funcionalidad completa disponible con base de datos)")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Alumno</DialogTitle>
          <DialogDescription>
            Completa la información del nuevo alumno. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre *
            </Label>
            <Input id="name" placeholder="Nombre completo" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email *
            </Label>
            <Input id="email" type="email" placeholder="email@ejemplo.com" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Teléfono
            </Label>
            <Input id="phone" placeholder="+54 9 11 1234-5678" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal" className="text-right">
              Objetivo
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight-loss">Pérdida de peso</SelectItem>
                <SelectItem value="muscle-gain">Ganancia muscular</SelectItem>
                <SelectItem value="endurance">Resistencia</SelectItem>
                <SelectItem value="strength">Fuerza</SelectItem>
                <SelectItem value="general">Fitness general</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">
              Plan
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico - 2 sesiones/semana</SelectItem>
                <SelectItem value="standard">Estándar - 3 sesiones/semana</SelectItem>
                <SelectItem value="premium">Premium - 4 sesiones/semana</SelectItem>
                <SelectItem value="unlimited">Ilimitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="hover:bg-orange-500 transition-colors"
          >
            Agregar Alumno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}