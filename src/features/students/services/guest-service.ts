import { supabase } from "@/services/database";

export interface Guest {
    id: string;
    trainer_id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
    linked_user_id?: string | null;
    status: "active" | "inactive" | "pending";
    created_at: string;
    updated_at: string;
}

export interface CreateGuestData {
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
    status?: "active" | "inactive" | "pending";
}

export const guestService = {
    async createGuest(data: CreateGuestData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data: guest, error } = await supabase
            .from("guests")
            .insert({
                ...data,
                trainer_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return guest;
    },

    async getGuests() {
        const { data: guests, error } = await supabase
            .from("guests")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return guests;
    },

    async updateGuest(id: string, data: Partial<CreateGuestData>) {
        const { data: guest, error } = await supabase
            .from("guests")
            .update(data)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return guest;
    },

    async deleteGuest(id: string) {
        const { error } = await supabase
            .from("guests")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
};
