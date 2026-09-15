const COVER_IMAGES: Record<string, any> = {
  "a-good-girls-guide-to-murder": require("@/assets/images/covers/a-good-girls-guide-to-murder.jpg"),
  "it-ends-with-us": require("@/assets/images/covers/it-ends-with-us.jpg"),
  "night-school": require("@/assets/images/covers/night-school.jpg"),
  "shatter-me": require("@/assets/images/covers/shatter-me.jpg"),
  "the-cruel-prince": require("@/assets/images/covers/the-cruel-prince.jpg"),
  "the-house-of-hades": require("@/assets/images/covers/the-house-of-hades.jpg"),
  "the-lost-hero": require("@/assets/images/covers/the-lost-hero.jpg"),
  "the-wicked-king": require("@/assets/images/covers/the-wicked-king.jpg"),
};

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function resolveCoverSource(title: string, coverUrl?: string | null) {
  const local = COVER_IMAGES[normalizeTitle(title)];
  if (local) return local;
  if (coverUrl) return { uri: coverUrl };
  return null;
}
