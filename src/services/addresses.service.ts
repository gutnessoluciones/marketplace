import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/utils";

interface AddressInput {
  label?: string;
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  phone?: string;
  is_default?: boolean;
}

export class AddressesService {
  constructor(private supabase: SupabaseClient) {}

  async list(userId: string) {
    const { data, error } = await this.supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw new AppError(error.message, 500);
    return data ?? [];
  }

  async create(userId: string, input: AddressInput) {
    // If this is default, unset others
    if (input.is_default) {
      await this.supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { data, error } = await this.supabase
      .from("addresses")
      .insert({ ...input, user_id: userId })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(id: string, userId: string, input: Partial<AddressInput>) {
    if (input.is_default) {
      await this.supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { data, error } = await this.supabase
      .from("addresses")
      .update(input)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async delete(id: string, userId: string) {
    const { error } = await this.supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new AppError(error.message, 500);
  }

  async getDefault(userId: string) {
    const { data } = await this.supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_default", true)
      .single();

    return data;
  }
}
