import { supabase } from "@/services/supabase";

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  cover_url: string | null;
  created_at: string;
};

export const DEFAULT_COLLECTION_NAMES = [
  "Save",
  "Currently reading",
  "Read",
  "Want to read",
  "Favorites",
] as const;

const STATUS_BY_COLLECTION: Record<
  string,
  "reading" | "finished" | "want_to_read" | undefined
> = {
  "Currently reading": "reading",
  Read: "finished",
  "Want to read": "want_to_read",
};

export function statusForCollection(name: string) {
  return STATUS_BY_COLLECTION[name];
}

async function ensureDefaultCollections(
  userId: string,
  existingNames: Set<string>,
) {
  const missing = DEFAULT_COLLECTION_NAMES.filter(
    (name) => !existingNames.has(name),
  );
  if (missing.length === 0) return;

  const { error } = await supabase
    .from("collections")
    .insert(missing.map((name) => ({ user_id: userId, name })));
  if (error) throw error;
}

export async function getUserCollections(): Promise<Collection[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("collections")
    .select("id, user_id, name, cover_url, created_at")
    .eq("user_id", user.id);
  if (error) throw error;

  let rows = (data ?? []) as Collection[];
  const existingNames = new Set(rows.map((c) => c.name));

  const missingDefaults = DEFAULT_COLLECTION_NAMES.filter(
    (n) => !existingNames.has(n),
  );
  if (missingDefaults.length > 0) {
    await ensureDefaultCollections(user.id, existingNames);
    const { data: refreshed, error: refetchError } = await supabase
      .from("collections")
      .select("id, user_id, name, cover_url, created_at")
      .eq("user_id", user.id);
    if (refetchError) throw refetchError;
    rows = (refreshed ?? []) as Collection[];
  }

  return rows.sort((a, b) => {
    const ai = DEFAULT_COLLECTION_NAMES.indexOf(a.name as any);
    const bi = DEFAULT_COLLECTION_NAMES.indexOf(b.name as any);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getBookCollectionIds(
  bookId: string,
  myCollectionIds: string[],
): Promise<Set<string>> {
  if (myCollectionIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("collection_books")
    .select("collection_id")
    .eq("book_id", bookId)
    .in("collection_id", myCollectionIds);
  if (error) throw error;

  return new Set((data ?? []).map((row) => row.collection_id));
}

export async function toggleBookInCollection(
  collectionId: string,
  bookId: string,
  isCurrentlyIn: boolean,
) {
  if (isCurrentlyIn) {
    const { error } = await supabase
      .from("collection_books")
      .delete()
      .eq("collection_id", collectionId)
      .eq("book_id", bookId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("collection_books")
      .insert({ collection_id: collectionId, book_id: bookId });
    if (error) throw error;
  }
}

export async function setBookStatus(
  bookId: string,
  status: "reading" | "finished" | "want_to_read",
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nisi ulogovana.");

  const { data: existing, error: fetchError } = await supabase
    .from("user_books")
    .select("id, started_at")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  const patch: Record<string, any> = { status };
  if (status === "reading" && !existing?.started_at) {
    patch.started_at = new Date().toISOString();
  }
  if (status === "finished") {
    patch.finished_at = new Date().toISOString();
  }

  if (existing) {
    const { error } = await supabase
      .from("user_books")
      .update(patch)
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("user_books").insert({
      user_id: user.id,
      book_id: bookId,
      current_page: 0,
      progress_percent: 0,
      ...patch,
    });
    if (error) throw error;
  }
}
