export const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

export const getDaysInMonth = (month: number, year: number) =>
  new Date(year, month + 1, 0).getDate()

export const getFirstDayOfMonth = (month: number, year: number) =>
  new Date(year, month, 1).getDay()

export const formatDate = (day: number, month: number, year: number) =>
  new Date(year, month, day).toISOString().split("T")[0]

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const

export const getMonthName = (month: number) => MONTH_NAMES[month] ?? ""

export const getEventTypeLabel = (type: "training" | "routine_send" | "payment" | "custom") => {
  switch (type) {
    case "training":
      return "Entrenamiento"
    case "routine_send":
      return "Enviar Rutina"
    case "payment":
      return "Pago"
    case "custom":
      return "Personalizado"
    default:
      return type
  }
}

export const getEventTypeIcon = (type: "training" | "routine_send" | "payment" | "custom") => {
  switch (type) {
    case "training":
      return "🏋️"
    case "routine_send":
      return "📤"
    case "payment":
      return "💰"
    case "custom":
      return "📝"
    default:
      return "📅"
  }
}
