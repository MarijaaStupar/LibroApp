import { resolveCoverSource } from "@/constants/bookCovers";
import { COLORS, FONTS } from "@/constants/theme";
import type { BookCatalog } from "@/services/books";
import {
    getBooksByMood,
    getBooksUnderPages,
    searchCatalog,
    type MoodKey,
} from "@/services/explore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    title?: string;
    q?: string;
    mood?: string;
    max?: string;
  }>();

  const [books, setBooks] = useState<BookCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        let result: BookCatalog[] = [];
        if (params.mode === "search" && params.q) {
          result = await searchCatalog(params.q);
        } else if (params.mode === "pages" && params.max) {
          result = await getBooksUnderPages(Number(params.max));
        } else if (params.mode === "mood" && params.mood) {
          result = await getBooksByMood(params.mood as MoodKey);
        }
        if (active) setBooks(result);
      } catch (e) {
        if (active) setErrorMsg("Nije uspelo učitavanje. Pokušaj ponovo.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [params.mode, params.q, params.mood, params.max]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {params.title || "Results"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.primaryPink} />
        </View>
      ) : errorMsg ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>{errorMsg}</Text>
        </View>
      ) : books.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>
            No books found for this yet. Try something else.
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const coverSource = resolveCoverSource(item.title, item.cover_url);
            return (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/book/${item.id}`)}
              >
                {coverSource ? (
                  <Image
                    source={coverSource}
                    style={styles.cover}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.cover, styles.coverFallback]}>
                    <Ionicons
                      name="book"
                      size={22}
                      color={COLORS.textSecondary}
                    />
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.author ? (
                    <Text style={styles.cardAuthor} numberOfLines={1}>
                      {item.author}
                    </Text>
                  ) : null}
                  {item.total_pages ? (
                    <Text style={styles.cardPages}>
                      {item.total_pages} pages
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: FONTS.serifSemiBold,
    fontSize: 18,
    color: COLORS.textMain,
    marginHorizontal: 8,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  cover: { width: 60, height: 86, borderRadius: 4 },
  coverFallback: {
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, justifyContent: "center" },
  cardTitle: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 16,
    color: COLORS.textMain,
  },
  cardAuthor: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardPages: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
