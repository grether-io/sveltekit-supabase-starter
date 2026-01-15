// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { Session, SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			userRole: { name: string; level: number } | null;
			hasRole: (minLevel: number) => boolean;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
			userRole?: { name: string; level: number } | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

// Extend Supabase User type to include role claims in app_metadata
declare module '@supabase/supabase-js' {
	interface UserAppMetadata {
		role?: string;
		role_level?: number;
		firstname?: string;
		lastname?: string;
		display_name?: string;
	}
}

export {};
