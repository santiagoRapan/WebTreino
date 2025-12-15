/**
 * Exercise Mappings
 * 
 * This file contains mappings between UI labels (Spanish) and database values (actual DB values).
 * Based on real database query results from exercises table.
 * This ensures filters work correctly and data is consistent across the application.
 */

// ==================== TARGET MUSCLES ====================
// Actual DB values from: target_muscles column

export const MUSCLE_MAPPINGS = {
  // Spanish Label -> Actual DB Value
  "Pectorales": "pectorals",
  "Bíceps": "biceps",
  "Tríceps": "triceps",
  "Dorsales": "lats",
  "Deltoides": "delts",
  "Cuádriceps": "quads",
  "Isquiotibiales": "hamstrings",
  "Glúteos": "glutes",
  "Gemelos": "calves",
  "Abdominales": "abs",
  "Espalda Superior": "upper back",
  "Trapecio": "traps",
  "Aductores": "adductors",
  "Abductores": "abductors",
  "Antebrazos": "forearms",
  "Serrato Anterior": "serratus anterior",
  "Elevador de la Escápula": "levator scapulae",
  "Columna": "spine",
  "Sistema Cardiovascular": "cardiovascular system",
} as const

// Reverse mapping for displaying database values in the UI
export const MUSCLE_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(MUSCLE_MAPPINGS).map(([spanish, english]) => [english, spanish])
)

// Get Spanish labels for UI
export const MUSCLE_LABELS = Object.keys(MUSCLE_MAPPINGS)

// Get English DB values
export const MUSCLE_DB_VALUES = Object.values(MUSCLE_MAPPINGS)

// ==================== BODY PARTS ====================
// Actual DB values from: body_parts column

export const BODY_PART_MAPPINGS = {
  // Spanish Label -> Actual DB Value
  "Pecho": "chest",
  "Espalda": "back",
  "Cardio": "cardio",
  "Antebrazos": "lower arms",
  "Cintura": "waist",
  "Hombros": "shoulders",
  "Piernas Inferiores": "lower legs",
  "Brazos Superiores": "upper arms",
  "Cuello": "neck",
  "Piernas Superiores": "upper legs",
} as const

export const BODY_PART_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(BODY_PART_MAPPINGS).map(([spanish, english]) => [english, spanish])
)

export const BODY_PART_LABELS = Object.keys(BODY_PART_MAPPINGS)
export const BODY_PART_DB_VALUES = Object.values(BODY_PART_MAPPINGS)

// ==================== EQUIPMENT ====================
// Actual DB values from: equipments column

export const EQUIPMENT_MAPPINGS = {
  // Spanish Label -> Actual DB Value
  "Máquina": "machine",
  "Ergómetro de Parte Superior": "upper body ergometer",
  "Rodillo": "roller",
  "Máquina SkiErg": "skierg machine",
  "Cuerda": "rope",
  "Máquina Elíptica": "elliptical machine",
  "Máquina de Escaleras": "stepmill machine",
  "Neumático": "tire",
  "Martillo": "hammer",
  "Mancuerna": "dumbbell",
  "Rodillo de Rueda": "wheel roller",
  "Asistido": "assisted",
  "Barra": "barbell",
  "Bosu Ball": "bosu ball",
  "Pelota de Estabilidad": "stability ball",
  "Peso Corporal": "body weight",
  "Bicicleta Estática": "stationary bike",
  "Banda": "band",
  "Cable": "cable",
} as const

export const EQUIPMENT_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(EQUIPMENT_MAPPINGS).map(([spanish, english]) => [english, spanish])
)

export const EQUIPMENT_LABELS = Object.keys(EQUIPMENT_MAPPINGS)
export const EQUIPMENT_DB_VALUES = Object.values(EQUIPMENT_MAPPINGS)

// ==================== SECONDARY MUSCLES ====================
// Actual DB values from: secondary_muscles column
// Note: Secondary muscles overlap with target muscles but have additional specific values

export const SECONDARY_MUSCLE_MAPPINGS = {
  // Spanish Label -> Actual DB Value
  "Sóleo": "soleus",
  "Core": "core",
  "Tobillos": "ankles",
  "Trapecio": "trapezius",
  "Glúteos": "glutes",
  "Hombros": "shoulders",
  "Manos": "hands",
  "Parte Interna de Muslos": "inner thighs",
  "Pecho": "chest",
  "Dorsal Ancho": "latissimus dorsi",
  "Flexores de Muñeca": "wrist flexors",
  "Manguito Rotador": "rotator cuff",
  "Extensores de Muñeca": "wrist extensors",
  "Pies": "feet",
  "Estabilizadores de Tobillo": "ankle stabilizers",
  "Isquiotibiales": "hamstrings",
  "Antebrazos": "forearms",
  "Espalda Superior": "upper back",
  "Abdominales Inferiores": "lower abs",
  "Deltoides Posteriores": "rear deltoids",
  "Bíceps": "biceps",
  "Oblicuos": "obliques",
  "Espalda Baja": "lower back",
  "Braquial": "brachialis",
  "Gemelos": "calves",
  "Cuádriceps": "quadriceps",
  "Muñecas": "wrists",
  "Romboides": "rhomboids",
  "Tríceps": "triceps",
  "Abdominales": "abdominals",
  "Deltoides": "deltoids",
  "Espalda": "back",
  "Pecho Superior": "upper chest",
  "Trapecios": "traps",
  "Espinillas": "shins",
  "Ingle": "groin",
  "Músculos de Agarre": "grip muscles",
  "Flexores de Cadera": "hip flexors",
  "Esternocleidomastoideo": "sternocleidomastoid",
  "Dorsales": "lats",
} as const

export const SECONDARY_MUSCLE_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(SECONDARY_MUSCLE_MAPPINGS).map(([spanish, english]) => [english, spanish])
)

export const SECONDARY_MUSCLE_LABELS = Object.keys(SECONDARY_MUSCLE_MAPPINGS)
export const SECONDARY_MUSCLE_DB_VALUES = Object.values(SECONDARY_MUSCLE_MAPPINGS)

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert Spanish UI labels to database values
 */
export function muscleToDbValue(spanishLabel: string): string {
  return MUSCLE_MAPPINGS[spanishLabel as keyof typeof MUSCLE_MAPPINGS] || spanishLabel.toLowerCase()
}

export function secondaryMuscleToDbValue(spanishLabel: string): string {
  return SECONDARY_MUSCLE_MAPPINGS[spanishLabel as keyof typeof SECONDARY_MUSCLE_MAPPINGS] || spanishLabel.toLowerCase()
}

export function bodyPartToDbValue(spanishLabel: string): string {
  return BODY_PART_MAPPINGS[spanishLabel as keyof typeof BODY_PART_MAPPINGS] || spanishLabel.toLowerCase()
}

export function equipmentToDbValue(spanishLabel: string): string {
  return EQUIPMENT_MAPPINGS[spanishLabel as keyof typeof EQUIPMENT_MAPPINGS] || spanishLabel.toLowerCase()
}

/**
 * Convert database values to Spanish UI labels
 */
export function muscleToDisplayName(dbValue: string): string {
  return MUSCLE_DISPLAY_NAMES[dbValue] || dbValue
}

export function secondaryMuscleToDisplayName(dbValue: string): string {
  return SECONDARY_MUSCLE_DISPLAY_NAMES[dbValue] || dbValue
}

export function bodyPartToDisplayName(dbValue: string): string {
  return BODY_PART_DISPLAY_NAMES[dbValue] || dbValue
}

export function equipmentToDisplayName(dbValue: string): string {
  return EQUIPMENT_DISPLAY_NAMES[dbValue] || dbValue
}

/**
 * Convert arrays of Spanish labels to database values
 */
export function musclesArrayToDb(spanishLabels: string[]): string[] {
  return spanishLabels.map(muscleToDbValue)
}

export function secondaryMusclesArrayToDb(spanishLabels: string[]): string[] {
  return spanishLabels.map(secondaryMuscleToDbValue)
}

export function bodyPartsArrayToDb(spanishLabels: string[]): string[] {
  return spanishLabels.map(bodyPartToDbValue)
}

export function equipmentsArrayToDb(spanishLabels: string[]): string[] {
  return spanishLabels.map(equipmentToDbValue)
}

/**
 * Convert arrays of database values to Spanish labels
 */
export function musclesArrayToDisplay(dbValues: string[]): string[] {
  return dbValues.map(muscleToDisplayName)
}

export function secondaryMusclesArrayToDisplay(dbValues: string[]): string[] {
  return dbValues.map(secondaryMuscleToDisplayName)
}

export function bodyPartsArrayToDisplay(dbValues: string[]): string[] {
  return dbValues.map(bodyPartToDisplayName)
}

export function equipmentsArrayToDisplay(dbValues: string[]): string[] {
  return dbValues.map(equipmentToDisplayName)
}

