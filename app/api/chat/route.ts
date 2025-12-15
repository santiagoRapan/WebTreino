import { google } from '@ai-sdk/google';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { supabaseServer, createAuthenticatedClient } from '@/services/database/supabaseServer';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define schemas outside to help with type inference
const getExercisesSchema = z.object({
    name: z.string().optional().describe('Exercise name to search in ENGLISH (e.g., "bench press", "curl", "squat", "deadlift")'),
    muscle: z.string().optional().describe('Target muscle in ENGLISH. Valid values: "pectorals", "lats", "biceps", "triceps", "delts", "quadriceps", "hamstrings", "glutes", "abs", "calves", "forearms", "traps", "upper back"'),
    equipment: z.string().optional().describe('Equipment in ENGLISH (e.g., "barbell", "dumbbell", "cable", "machine", "body weight")'),
    limit: z.number().optional().default(10).describe('Maximum number of results'),
});

const blockExerciseSchema = z.object({
    exercise_id: z.string().describe('ID del ejercicio (obtenido de getExercises)'),
    sets: z.number().default(3).describe('Número de series (estándar gym: 3-4)'),
    reps: z.string().default('10').describe('Repeticiones por serie (ej: "10", "8-12", "6-8")'),
    notes: z.string().optional().describe('Notas para este ejercicio'),
});

const blockSchema = z.object({
    name: z.string().describe('Nombre del bloque (ej: "Calentamiento", "Pecho", "Espalda")'),
    exercises: z.array(blockExerciseSchema),
});

const createRoutineSchema = z.object({
    name: z.string().describe('Nombre de la rutina (ej: "Rutina de Pecho y Espalda")'),
    description: z.string().optional().describe('Descripción de la rutina'),
    blocks: z.array(blockSchema),
});

export async function POST(req: Request) {
    const body = await req.json();
    const messages = body.messages || [];
    const ownerId = body.ownerId; // Get owner_id from request body
    const accessToken = body.accessToken; // Get access token for authenticated requests

    console.log('[API/chat] Received messages count:', messages.length);
    console.log('[API/chat] Owner ID:', ownerId);
    console.log('[API/chat] Has access token:', !!accessToken);

    // Use authenticated client if access token is provided, otherwise use server client
    const supabase = accessToken ? createAuthenticatedClient(accessToken) : supabaseServer;

    // Convert UI messages to simple format for the model
    const modelMessages = messages.map((msg: any) => {
        if (msg.role === 'assistant' && msg.parts) {
            const textPart = msg.parts.find((p: any) => p.type === 'text');
            return {
                role: 'assistant',
                content: textPart?.text || ''
            };
        }
        return {
            role: msg.role,
            content: msg.content || ''
        };
    });

    console.log('[API/chat] Model messages:', JSON.stringify(modelMessages, null, 2));

    const result = streamText({
        model: google('gemini-2.5-flash'),
        stopWhen: stepCountIs(7), // Allow multiple tool calls + final text response
        system: `Eres un asistente experto en fitness para la aplicación "Treino".
Tu objetivo es ayudar a entrenadores a diseñar rutinas de entrenamiento para sus clientes.

IMPORTANTE - BASE DE DATOS EN INGLÉS:
Los ejercicios están almacenados en INGLÉS. Cuando busques ejercicios, usa estos nombres de músculos:
- Pecho = "pectorals"
- Espalda = "lats" o "upper back"
- Bíceps = "biceps"
- Tríceps = "triceps"
- Hombros = "delts"
- Cuádriceps = "quadriceps"
- Isquiotibiales = "hamstrings"
- Glúteos = "glutes"
- Abdominales = "abs"
- Pantorrillas = "calves"
- Trapecios = "traps"

FLUJO PARA CREAR RUTINAS:
1. Cuando el usuario pida crear una rutina, usa 'getExercises' para buscar ejercicios por músculo EN INGLÉS.
2. Busca ejercicios para CADA grupo muscular mencionado.
3. Una vez que tengas los IDs de los ejercicios, usa 'createRoutine' para crear la rutina.
4. SIEMPRE debes llamar a createRoutine después de obtener los ejercicios.

ESTÁNDARES DE GYM (usar si el usuario no especifica):
- Ejercicios compuestos: 4 series x 6-8 reps
- Ejercicios de aislamiento: 3 series x 10-12 reps

REGLA CRÍTICA - RESPUESTA OBLIGATORIA:
- SIEMPRE debes enviar un mensaje de texto después de usar herramientas
- Después de createRoutine, DEBES responder con un resumen breve
- NUNCA termines sin dar una respuesta de texto al usuario
- Formato del resumen: "✅ **Rutina creada:** [nombre] con [X] ejercicios. Ya está disponible en tu sección de Rutinas."

FORMATO DE RESPUESTA:
- Responde siempre en ESPAÑOL.
- Usa Markdown minimalista: viñetas cortas (•), negritas solo para nombres de ejercicios/pasos clave. Evita subtítulos y párrafos largos.
- Sé breve: máximo 3-4 viñetas o 60-80 palabras. Sin texto redundante.
- Si das listas de ejercicios, limita a 4 ítems como máximo.

Responde en español. Sé muy conciso.`,
        messages: modelMessages,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: {
            getExercises: tool({
                description: 'Buscar ejercicios en la base de datos. SIEMPRE usar antes de crear una rutina para obtener IDs válidos de ejercicios.',
                inputSchema: getExercisesSchema,
                execute: async ({ name, muscle, equipment, limit }) => {
                    console.log('[getExercises] Searching with params:', { name, muscle, equipment, limit });
                    
                    let query = supabase
                        .from('exercises')
                        .select('id, name, target_muscles, equipments')
                        .limit(limit || 10);

                    if (name) {
                        query = query.ilike('name', `%${name}%`);
                    }
                    if (muscle) {
                        query = query.contains('target_muscles', [muscle.toLowerCase()]);
                    }
                    if (equipment) {
                        query = query.contains('equipments', [equipment.toLowerCase()]);
                    }

                    const { data, error } = await query;

                    if (error) {
                        console.error('[getExercises] Error:', error);
                        return { success: false, error: error.message, exercises: [] };
                    }

                    console.log('[getExercises] Found:', data?.length, 'exercises');
                    console.log('[getExercises] Data:', JSON.stringify(data, null, 2));
                    
                    const result = { 
                        success: true, 
                        exercises: data || [],
                        message: data?.length ? `Encontré ${data.length} ejercicios` : 'No se encontraron ejercicios con esos criterios'
                    };
                    console.log('[getExercises] Returning:', JSON.stringify(result, null, 2));
                    return result;
                },
            }),

            createRoutine: tool({
                description: 'Crear una nueva rutina de entrenamiento. IMPORTANTE: Primero buscar ejercicios con getExercises para obtener IDs válidos.',
                inputSchema: createRoutineSchema,
                execute: async ({ name, description, blocks }) => {
                    console.log('[createRoutine] Creating routine:', name);
                    console.log('[createRoutine] Owner ID:', ownerId);
                    
                    if (!ownerId) {
                        return { success: false, error: 'No se proporcionó el ID del entrenador. Por favor, inicia sesión.' };
                    }

                    // Collect all exercise IDs for validation
                    const allExerciseIds = blocks.flatMap(block => 
                        block.exercises.map(ex => ex.exercise_id)
                    );

                    // Validate that all exercise IDs exist
                    console.log('[createRoutine] Validating exercise IDs:', allExerciseIds);
                    const { data: validExercises, error: validationError } = await supabase
                        .from('exercises')
                        .select('id, name')
                        .in('id', allExerciseIds);

                    if (validationError) {
                        console.error('[createRoutine] Validation error:', validationError);
                        return { success: false, error: 'Error validando ejercicios: ' + validationError.message };
                    }

                    const validIds = new Set(validExercises?.map(e => e.id) || []);
                    const invalidIds = allExerciseIds.filter(id => !validIds.has(id));

                    if (invalidIds.length > 0) {
                        console.error('[createRoutine] Invalid exercise IDs:', invalidIds);
                        return { 
                            success: false, 
                            error: `Los siguientes IDs de ejercicio no existen: ${invalidIds.join(', ')}. Usa getExercises para obtener IDs válidos.`
                        };
                    }

                    try {
                        // 1. Create the routine
                        const { data: routineData, error: routineError } = await supabase
                            .from('routines')
                            .insert({
                                owner_id: ownerId,
                                name,
                                description: description || null,
                            })
                            .select()
                            .single();

                        if (routineError) {
                            console.error('[createRoutine] Error creating routine:', routineError);
                            return { success: false, error: 'Error creando rutina: ' + routineError.message };
                        }

                        const routineId = routineData.id;
                        console.log('[createRoutine] Routine created with ID:', routineId);

                        // 2. Create blocks and exercises
                        for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
                            const block = blocks[blockIndex];

                            // Create block
                            const { data: blockData, error: blockError } = await supabase
                                .from('routine_block')
                                .insert({
                                    routine_id: routineId,
                                    name: block.name,
                                    block_order: blockIndex + 1,
                                })
                                .select()
                                .single();

                            if (blockError) {
                                console.error('[createRoutine] Error creating block:', blockError);
                                // Cleanup: delete the routine if block creation fails
                                await supabase.from('routines').delete().eq('id', routineId);
                                return { success: false, error: 'Error creando bloque: ' + blockError.message };
                            }

                            const blockId = blockData.id;
                            console.log('[createRoutine] Block created:', block.name, 'ID:', blockId);

                            // 3. Create exercises in block
                            for (let exIndex = 0; exIndex < block.exercises.length; exIndex++) {
                                const exercise = block.exercises[exIndex];

                                // Create block_exercise_v2
                                const { data: blockExData, error: blockExError } = await supabase
                                    .from('block_exercise_v2')
                                    .insert({
                                        block_id: blockId,
                                        exercise_id: exercise.exercise_id,
                                        display_order: exIndex + 1,
                                        notes: exercise.notes || null,
                                    })
                                    .select()
                                    .single();

                                if (blockExError) {
                                    console.error('[createRoutine] Error creating block exercise:', blockExError);
                                    await supabase.from('routines').delete().eq('id', routineId);
                                    return { success: false, error: 'Error añadiendo ejercicio: ' + blockExError.message };
                                }

                                const blockExerciseId = blockExData.id;

                                // 4. Create sets for each exercise
                                const setsToInsert = [];
                                for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
                                    setsToInsert.push({
                                        block_exercise_id: blockExerciseId,
                                        set_index: setIndex + 1,
                                        reps: exercise.reps,
                                        unit: 'kg',
                                    });
                                }

                                const { error: setsError } = await supabase
                                    .from('block_exercise_set_v2')
                                    .insert(setsToInsert);

                                if (setsError) {
                                    console.error('[createRoutine] Error creating sets:', setsError);
                                    await supabase.from('routines').delete().eq('id', routineId);
                                    return { success: false, error: 'Error creando series: ' + setsError.message };
                                }
                            }
                        }

                        // Get exercise names for the response
                        const exerciseNames = validExercises?.map(e => e.name).join(', ');

                        console.log('[createRoutine] Routine created successfully!');
                        return { 
                            success: true, 
                            routineId,
                            message: `✅ Rutina "${name}" creada exitosamente con ${blocks.length} bloques y ${allExerciseIds.length} ejercicios: ${exerciseNames}`
                        };

                    } catch (error: any) {
                        console.error('[createRoutine] Unexpected error:', error);
                        return { success: false, error: 'Error inesperado: ' + error.message };
                    }
                },
            }),
        },
        onStepFinish: async ({ toolResults }) => {
            if (toolResults && toolResults.length > 0) {
                console.log('[API/chat] Step finished with tool results:', JSON.stringify(toolResults, null, 2));
            }
        },
    });

    return result.toUIMessageStreamResponse();
}
