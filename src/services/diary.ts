import { supabase } from "@/services/supabase";

export type DiaryEntry = {
  id: string;
  created_at: string;
  user_id: string;
  book_id: string;
  page: number | null;
  note: string;
};

export async function getDiaryEntries(bookId: string): Promise<DiaryEntry[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nisi ulogovana.");

  const { data, error } = await supabase
    .from("diary_entries")
    .select("id, created_at, user_id, book_id, page, note")
    .eq("book_id", bookId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DiaryEntry[];
}

export async function createDiaryEntry(
  bookId: string,
  page: number | null,
  note: string,
): Promise<DiaryEntry> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nisi ulogovana.");

  const { data, error } = await supabase
    .from("diary_entries")
    .insert({ user_id: user.id, book_id: bookId, page, note })
    .select("id, created_at, user_id, book_id, page, note")
    .single();
  if (error) throw error;
  return data as DiaryEntry;
}

export async function updateDiaryEntry(
  id: string,
  page: number | null,
  note: string,
): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from("diary_entries")
    .update({ page, note })
    .eq("id", id)
    .select("id, created_at, user_id, book_id, page, note")
    .single();
  if (error) throw error;
  return data as DiaryEntry;
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  const { error } = await supabase.from("diary_entries").delete().eq("id", id);
  if (error) throw error;
}
