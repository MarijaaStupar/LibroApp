import type { BookCatalog } from "@/services/books";
import { supabase } from "@/services/supabase";

const CATALOG_SELECT =
  "id, title, author, cover_url, total_pages, genres, subjects";

type CatalogBookWithTags = BookCatalog & {
  genres: string[] | null;
  subjects: string[] | null;
};

export type MoodKey =
  | "cozy"
  | "dark"
  | "romantic"
  | "adventure"
  | "cry"
  | "think";

export const MOODS: {
  key: MoodKey;
  label: string;
  icon: string;
  iconSet: "ion" | "mci";
}[] = [
  {
    key: "cozy",
    label: "Cozy &\ncomforting",
    icon: "cafe-outline",
    iconSet: "ion",
  },
  { key: "dark", label: "Dark &\nmysterious", icon: "moon", iconSet: "ion" },
  {
    key: "romantic",
    label: "Light &\nromantic",
    icon: "flower-outline",
    iconSet: "ion",
  },
  {
    key: "adventure",
    label: "Epic\nadventure",
    icon: "image-filter-hdr",
    iconSet: "mci",
  },
  { key: "cry", label: "Make me\ncry", icon: "water", iconSet: "ion" },
  { key: "think", label: "Make me\nthink", icon: "leaf", iconSet: "ion" },
];

// Ključne reči po raspoloženju - tražimo ih (case-insensitive) unutar genres/subjects nizova.
// Slobodno dopuni/izmeni liste ako vidiš da ti prava baza ima drugačije nazive žanrova.
const MOOD_KEYWORDS: Record<MoodKey, string[]> = {
  cozy: [
    "cozy",
    "comfort",
    "contemporary",
    "slice of life",
    "family",
    "feel-good",
    "heartwarming",
    "cooking",
  ],
  dark: [
    "dark",
    "horror",
    "thriller",
    "gothic",
    "noir",
    "crime",
    "suspense",
    "psychological",
  ],
  romantic: ["romance", "romantic", "love stories", "chick lit"],
  adventure: ["adventure", "fantasy", "epic", "quest", "saga", "action"],
  cry: [
    "tragedy",
    "grief",
    "loss",
    "sad",
    "emotional",
    "drama",
    "coming of age",
  ],
  think: [
    "philosophy",
    "science",
    "self-help",
    "psychology",
    "essay",
    "history",
    "nonfiction",
    "politics",
  ],
};

export async function searchCatalog(query: string): Promise<BookCatalog[]> {
  const q = query.trim();
  if (!q) return [];

  const { data, error } = await supabase
    .from("books")
    .select(CATALOG_SELECT)
    .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
    .limit(40);

  if (error) throw error;
  return (data ?? []) as BookCatalog[];
}

export async function getBooksUnderPages(
  maxPages: number,
): Promise<BookCatalog[]> {
  const { data, error } = await supabase
    .from("books")
    .select(CATALOG_SELECT)
    .gt("total_pages", 0)
    .lt("total_pages", maxPages)
    .order("total_pages", { ascending: true })
    .limit(40);

  if (error) throw error;
  return (data ?? []) as BookCatalog[];
}

export async function getBooksByMood(mood: MoodKey): Promise<BookCatalog[]> {
  const keywords = MOOD_KEYWORDS[mood] ?? [];

  const { data, error } = await supabase
    .from("books")
    .select(CATALOG_SELECT)
    .limit(300);
  if (error) throw error;

  const books = (data ?? []) as CatalogBookWithTags[];
  return books.filter((book) => {
    const tags = [...(book.genres ?? []), ...(book.subjects ?? [])]
      .join(" ")
      .toLowerCase();
    return keywords.some((keyword) => tags.includes(keyword));
  });
}

export async function getRandomBook(): Promise<BookCatalog | null> {
  const { data: ids, error } = await supabase.from("books").select("id");
  if (error) throw error;
  if (!ids || ids.length === 0) return null;

  const randomId = ids[Math.floor(Math.random() * ids.length)].id;

  const { data: book, error: bookError } = await supabase
    .from("books")
    .select(CATALOG_SELECT)
    .eq("id", randomId)
    .maybeSingle();

  if (bookError) throw bookError;
  return book as BookCatalog | null;
}
