import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export type StoreIdentity = { user: User; discordId: string };
export type PriceMode = "normal" | "low_pop" | "high_season";

export function createStoreAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server configuration is missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function discordIdFromUser(user: User): string | null {
  const identity = user.identities?.find((item) => item.provider === "discord");
  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.provider_id,
    metadata.sub,
    metadata.id,
    identity?.identity_data?.provider_id,
    identity?.identity_data?.sub,
    identity?.identity_data?.id,
    identity?.id,
  ];
  const id = candidates.map((candidate) => candidate == null ? "" : String(candidate)).find((candidate) => /^\d{17,20}$/.test(candidate));
  return id ?? null;
}

export async function getStoreIdentity(): Promise<StoreIdentity | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase auth configuration is missing");

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components may not permit cookie writes; route handlers can.
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const discordId = discordIdFromUser(data.user);
  return discordId ? { user: data.user, discordId } : null;
}

export async function getStoreAdmin(): Promise<StoreIdentity | null> {
  const identity = await getStoreIdentity();
  if (!identity) return null;
  const allowedIds = (process.env.ADMIN_DISCORD_IDS ?? process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return allowedIds.includes(identity.discordId) ? identity : null;
}

export async function getPriceMode(db = createStoreAdminClient()): Promise<PriceMode> {
  const { data, error } = await db.from("system_settings").select("value").eq("key", "current_price_mode").maybeSingle();
  if (error) throw new Error("Could not read store pricing mode");
  const mode = data?.value;
  return mode === "low_pop" || mode === "high_season" ? mode : "normal";
}

export function calculateStorePrice(basePrice: number, mode: PriceMode): number {
  const multiplier = mode === "low_pop" ? 0.5 : mode === "high_season" ? 1.15 : 1;
  return Math.round(basePrice * multiplier * 100) / 100;
}
