import { supabase } from "@/services/supabase";

export type MyProfile = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
};

export async function getMyProfile(): Promise<MyProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nisi ulogovana.");

  const metaName = (user.user_metadata?.name as string | undefined) ?? "";
  const metaUsername =
    (user.user_metadata?.username as string | undefined) ?? "";

  const { data, error } = await supabase
    .from("users")
    .select("id, name, username, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;

  const name = data?.name || metaName || "Reader";
  const username = data?.username || metaUsername || "";
  const bio = data?.bio ?? null;
  const avatarUrl = data?.avatar_url ?? null;

  if (data && (!data.name || !data.username) && (metaName || metaUsername)) {
    await supabase
      .from("users")
      .update({
        name: data.name || metaName || null,
        username: data.username || metaUsername || null,
      })
      .eq("id", user.id);
  } else if (!data) {
    await supabase.from("users").upsert({
      id: user.id,
      name: metaName || null,
      username: metaUsername || null,
    });
  }

  return { id: user.id, name, username, bio, avatarUrl };
}

export async function updateMyBio(bio: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nisi ulogovana.");

  const { error } = await supabase
    .from("users")
    .update({ bio: bio.trim() || null })
    .eq("id", user.id);
  if (error) throw error;
}

export async function updateMyAvatar(avatarUrl: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nisi ulogovana.");

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);
  if (error) throw error;
}
