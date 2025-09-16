import type { Exercise } from "@/types/trainer"

export const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: "1",
    name: "Push-ups",
    gif_URL: "",
    target_muscles: ["chest", "triceps"],
    body_parts: ["upper body"],
    equipments: ["body weight"],
    description: "Classic bodyweight exercise for upper body strength",
    secondary_muscles: ["shoulders", "core"],
    category: "strength"
  },
  {
    id: "2", 
    name: "Squats",
    gif_URL: "",
    target_muscles: ["quadriceps", "glutes"],
    body_parts: ["lower body"],
    equipments: ["body weight"],
    description: "Fundamental lower body exercise",
    secondary_muscles: ["hamstrings", "calves"],
    category: "strength"
  },
  {
    id: "3",
    name: "Plank",
    gif_URL: "",
    target_muscles: ["core", "abs"],
    body_parts: ["core"],
    equipments: ["body weight"],
    description: "Isometric core strengthening exercise",
    secondary_muscles: ["shoulders", "glutes"],
    category: "core"
  },
  {
    id: "4",
    name: "Burpees",
    gif_URL: "",
    target_muscles: ["full body"],
    body_parts: ["full body"],
    equipments: ["body weight"],
    description: "High-intensity full body exercise",
    secondary_muscles: [],
    category: "cardio"
  },
  {
    id: "5",
    name: "Lunges",
    gif_URL: "",
    target_muscles: ["quadriceps", "glutes"],
    body_parts: ["lower body"],
    equipments: ["body weight"],
    description: "Single-leg strengthening exercise",
    secondary_muscles: ["hamstrings", "calves"],
    category: "strength"
  },
  {
    id: "6",
    name: "Pull-ups",
    gif_URL: "",
    target_muscles: ["lats", "biceps"],
    body_parts: ["upper body"],
    equipments: ["pull-up bar"],
    description: "Upper body pulling exercise",
    secondary_muscles: ["rhomboids", "rear delts"],
    category: "strength"
  },
  {
    id: "7",
    name: "Deadlifts",
    gif_URL: "",
    target_muscles: ["hamstrings", "glutes"],
    body_parts: ["lower body", "back"],
    equipments: ["barbell", "dumbbells"],
    description: "Compound posterior chain exercise",
    secondary_muscles: ["erector spinae", "traps"],
    category: "strength"
  },
  {
    id: "8",
    name: "Bench Press",
    gif_URL: "",
    target_muscles: ["chest", "triceps"],
    body_parts: ["upper body"],
    equipments: ["barbell", "bench"],
    description: "Primary chest development exercise",
    secondary_muscles: ["anterior delts"],
    category: "strength"
  }
]

export const UI_CONSTANTS = {
  THEME: {
    DARK: "dark" as const,
    LIGHT: "light" as const
  },
  
  TABS: {
    DASHBOARD: "dashboard",
    CLIENTS: "clients", 
    SCHEDULE: "schedule",
    ROUTINES: "routines",
    CHAT: "chat"
  },
  
  CLIENT_FILTERS: {
    ALL: "all" as const,
    ACTIVE: "active" as const,
    PENDING: "pending" as const
  },
  
  CHAT_FILTERS: {
    ALL: "all" as const,
    UNREAD: "unread" as const,
    FAVORITES: "favorites" as const
  },
  
  EVENT_TYPES: {
    TRAINING: "training" as const,
    ROUTINE_SEND: "routine_send" as const,
    PAYMENT: "payment" as const,
    CUSTOM: "custom" as const
  },
  
  EVENT_STATUS: {
    PENDING: "pending" as const,
    COMPLETED: "completed" as const,
    CANCELLED: "cancelled" as const
  }
} as const