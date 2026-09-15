import { supabase } from "@/services/supabase";

export type BookCatalog = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number;
};

export type UserBook = {
  id: string;
  user_id: string;
  book_id: string;
  status: "want_to_read" | "reading" | "finished";
  current_page: number;
  progress_percent: number;
  rating: number | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  books: BookCatalog;
};

const USER_BOOK_SELECT = "*, books(id, title, author, cover_url, total_pages)";

export function computeProgress(currentPage: number, totalPages: number) {
  if (!totalPages) return 0;
  return Math.min(100, Math.round((currentPage / totalPages) * 100));
}

export async function getCurrentlyReadingBook(): Promise<UserBook | null> {
  const { data, error } = await supabase
    .from("user_books")
    .select(USER_BOOK_SELECT)
    .eq("status", "reading")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as UserBook | null;
}

export async function getAllUserBooks(): Promise<UserBook[]> {
  const { data, error } = await supabase
    .from("user_books")
    .select(USER_BOOK_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as UserBook[];
}

export async function removeUserBook(userBookId: string): Promise<void> {
  const { error } = await supabase
    .from("user_books")
    .delete()
    .eq("id", userBookId);

  if (error) throw error;
}

export async function getUserBookById(id: string): Promise<UserBook | null> {
  const { data, error } = await supabase
    .from("user_books")
    .select(USER_BOOK_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as UserBook | null;
}

export async function updateCurrentPage(
  userBookId: string,
  currentPage: number,
  totalPages: number,
) {
  const { data, error } = await supabase
    .from("user_books")
    .update({
      current_page: currentPage,
      progress_percent: computeProgress(currentPage, totalPages),
    })
    .eq("id", userBookId)
    .select(USER_BOOK_SELECT)
    .single();

  if (error) throw error;
  return data as unknown as UserBook;
}

export async function markAsFinished(userBookId: string) {
  const { data, error } = await supabase
    .from("user_books")
    .update({ status: "finished", finished_at: new Date().toISOString() })
    .eq("id", userBookId)
    .select(USER_BOOK_SELECT)
    .single();

  if (error) throw error;
  return data as unknown as UserBook;
}

export async function rateBook(userBookId: string, rating: number) {
  const { data, error } = await supabase
    .from("user_books")
    .update({ rating })
    .eq("id", userBookId)
    .select(USER_BOOK_SELECT)
    .single();

  if (error) throw error;
  return data as unknown as UserBook;
}

export type BookDetails = BookCatalog & {
  description: string | null;
  published_date: string | null;
  average_rating: number | null;
  ratings_count: number | null;
  genres: string[] | null;
  subjects: string[] | null;
};

export async function getBookDetails(id: string): Promise<BookDetails | null> {
  const { data, error } = await supabase
    .from("books")
    .select(
      "id, title, author, cover_url, total_pages, description, published_date, average_rating, ratings_count, genres, subjects",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as BookDetails | null;
}
