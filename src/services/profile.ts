import { supabase } from "@/services/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

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
  if (error) {
    console.log("[DEBUG updateMyAvatar]", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function uploadAvatar(localUri: string): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nisi ulogovana.");

  // Napomena: fetch(uri).blob() ne radi pouzdano u React Native/Expo -
  // zna da pošalje prazan/neispravan sadržaj pa Supabase Storage to
  // odbije kao da korisnik uopšte nije ulogovan (RLS greška). Zato se
  // slika čita kao base64 pa pretvara u ArrayBuffer pre slanja.
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const path = `${user.id}/avatar.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("avatars2")
    .upload(path, decode(base64), { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars2").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
