import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/services/database';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: openai('gpt-4o'),
        system: `You are an expert fitness trainer assistant for the "Treino" application.
    Your goal is to help trainers design workouts and find exercise alternatives for their clients.
    
    You have access to a database of exercises.
    
    When suggesting exercises:
    1. ALWAYS check the database first using the 'getExercises' tool to ensure the exercise exists.
    2. If a specific exercise is requested but not found, use 'getExerciseVariants' to find alternatives.
    3. When listing exercises, provide the exact name as it appears in the database.
    4. Consider the client's equipment availability if mentioned.
    
    Format your workout plans clearly with:
    - Warm-up
    - Main Workout (with sets/reps)
    - Cool-down
    
    Be concise, professional, and encouraging.`,
        messages,
        tools: {
            getExercises: tool({
                description: 'Search for exercises in the database by name, muscle, or equipment.',
                parameters: z.object({
                    name: z.string().optional().describe('The name of the exercise to search for (e.g., "Press de Banca")'),
                    muscle: z.string().optional().describe('The target muscle (e.g., "Pectorales", "Dorsales")'),
                    equipment: z.string().optional().describe('The equipment needed (e.g., "Mancuerna", "Barra")'),
                    limit: z.number().optional().default(5).describe('Max number of results to return'),
                }),
                execute: async ({ name, muscle, equipment, limit }: { name?: string, muscle?: string, equipment?: string, limit?: number }) => {
                    let query = supabase
                        .from('exercises')
                        .select('id, name, target_muscles, equipments, gif_URL')
                        .limit(limit || 5);

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
                        console.error('Error fetching exercises:', error);
                        return [];
                    }

                    return data || [];
                },
            }),
            getExerciseVariants: tool({
                description: 'Find alternative exercises targeting the same muscles, useful for injuries or lack of equipment.',
                parameters: z.object({
                    targetMuscle: z.string().describe('The main muscle group (e.g., "Pectorales")'),
                    excludeEquipment: z.string().optional().describe('Equipment to exclude (e.g., "Barra" if the user has no bar)'),
                    limit: z.number().optional().default(3),
                }),
                execute: async ({ targetMuscle, excludeEquipment, limit }: { targetMuscle: string, excludeEquipment?: string, limit?: number }) => {
                    let query = supabase
                        .from('exercises')
                        .select('id, name, target_muscles, equipments')
                        .contains('target_muscles', [targetMuscle.toLowerCase()])
                        .limit(limit || 3);

                    // Note: Supabase doesn't have a simple "does not contain" for arrays in the JS client easily without raw SQL or post-filtering.
                    // We'll fetch a bit more and filter in JS for the exclusion if needed.

                    const { data, error } = await query;

                    if (error) {
                        return [];
                    }

                    if (excludeEquipment && data) {
                        return data.filter(ex => !ex.equipments?.includes(excludeEquipment.toLowerCase()));
                    }

                    return data || [];
                },
            }),
        },
    });

    return result.toUIMessageStreamResponse();
}
