import { createSupabaseServerClient } from '$lib/server/supabase';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(createSupabaseServerClient);

