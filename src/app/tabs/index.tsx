import NumberPromptModal from "@/components/NumberPromptModal";
import { resolveCoverSource } from "@/constants/bookCovers";
import { COLORS, FONTS } from "@/constants/theme";
import {
  UserBook,
  getCurrentlyReadingBook,
  updateCurrentPage,
} from "@/services/books";
import { getMyProfile } from "@/services/profile";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;
  const [book, setBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editPageVisible, setEditPageVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setErrorMsg("");
      const profile = await getMyProfile();
      setUserName(profile.name);
      setAvatarUrl(profile.avatarUrl);

      const currentBook = await getCurrentlyReadingBook();
      setBook(currentBook);
    } catch (e: any) {
      setErrorMsg(e.message ?? "Nešto je pošlo po zlu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleUpdatePage = async (values: Record<string, number>) => {
    if (!book) return;
    const newPage = Math.max(0, Math.min(book.books.total_pages, values.page));
    const updated = await updateCurrentPage(
      book.id,
      newPage,
      book.books.total_pages,
    );
    setBook(updated);
    setEditPageVisible(false);
  };

  const comingSoonStats = () =>
    Alert.alert(
      "Uskoro",
      "Praćenje dnevnog čitanja i streak-a biće uskoro dostupno.",
    );

  const comingSoonLog = () =>
    Alert.alert("Uskoro", "Log reading session će uskoro biti dostupan.");

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "bottom"]}>
        <ActivityIndicator color={COLORS.primaryPink} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Welcome back, {userName}!</Text>
            <Text style={styles.subGreeting}>What are we reading today?</Text>
          </View>
          <Pressable
            style={styles.avatar}
            onPress={() => router.push("/tabs/profile")}
          >
            {avatarUrl && (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            )}
          </Pressable>
        </View>

        {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        {book ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Currently reading</Text>

            <View style={styles.bookRow}>
              {resolveCoverSource(book.books.title, book.books.cover_url) ? (
                <Image
                  source={resolveCoverSource(
                    book.books.title,
                    book.books.cover_url,
                  )}
                  style={styles.cover}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.cover, styles.coverFallback]}>
                  <Ionicons name="book" size={28} color={COLORS.primaryPink} />
                </View>
              )}

              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {book.books.title}
                </Text>
                <Text style={styles.bookAuthor}>{book.books.author}</Text>

                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${book.progress_percent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercent}>
                    {book.progress_percent}%
                  </Text>
                </View>

                <Pressable onPress={() => setEditPageVisible(true)}>
                  <Text style={styles.pagesText}>
                    {book.current_page} of {book.books.total_pages} pages{" "}
                    <Ionicons
                      name="pencil"
                      size={12}
                      color={COLORS.textSecondary}
                    />
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.continueButton}
                  onPress={() => router.push(`/reading-room/${book.id}`)}
                >
                  <Text style={styles.continueButtonText}>
                    Continue reading
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Currently reading</Text>
            <Text style={styles.emptyText}>
              You don't have a book in progress right now. Add a book in Library
              to start tracking your progress.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's reading</Text>

          <View style={styles.statsRow}>
            <Pressable style={styles.statBox} onPress={comingSoonStats}>
              <View style={styles.statIconWrap}>
                <Ionicons name="book" size={20} color={COLORS.primaryPink} />
              </View>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>pages</Text>
            </Pressable>
            <Pressable style={styles.statBox} onPress={comingSoonStats}>
              <View style={styles.statIconWrap}>
                <Ionicons name="time" size={20} color={COLORS.primaryPink} />
              </View>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>min</Text>
            </Pressable>
            <Pressable style={styles.statBox} onPress={comingSoonStats}>
              <View style={styles.statIconWrap}>
                <Ionicons name="flame" size={20} color={COLORS.primaryPink} />
              </View>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>streak</Text>
            </Pressable>
          </View>

          <Pressable style={styles.logButton} onPress={comingSoonLog}>
            <Ionicons name="add" size={18} color={COLORS.textAccent} />
            <Text style={styles.logButtonText}>Log reading session</Text>
          </Pressable>
        </View>

        <View style={styles.quoteOuter}>
          <View style={styles.quoteCard}>
            <Image
              source={require("@/assets/images/quote-flower.png")}
              style={styles.quoteFlower}
              contentFit="contain"
            />
            <View style={styles.quoteTextWrap}>
              <Text style={styles.quoteText}>
                A good book today,{"\n"}a brighter you tomorrow.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {book && (
        <NumberPromptModal
          visible={editPageVisible}
          title="Update progress"
          fields={[
            {
              key: "page",
              label: `Current page (of ${book.books.total_pages})`,
              initialValue: book.current_page,
            },
          ]}
          onCancel={() => setEditPageVisible(false)}
          onSubmit={handleUpdatePage}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  greeting: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 24,
    color: COLORS.textMain,
  },
  subGreeting: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    marginLeft: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  errorText: {
    fontFamily: FONTS.sansRegular,
    color: "#C0392B",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 19,
    color: COLORS.textMain,
    marginBottom: 10,
  },
  bookRow: { flexDirection: "row" },
  cover: {
    width: 92,
    height: 136,
    borderRadius: 6,
    backgroundColor: COLORS.softPink,
  },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  bookInfo: { flex: 1, marginLeft: 14 },
  bookTitle: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 17,
    color: COLORS.textMain,
  },
  bookAuthor: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.progressTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primaryPink,
  },
  progressPercent: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 12,
    color: COLORS.textMain,
  },
  pagesText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  emptyText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: COLORS.softPink,
    borderRadius: 20,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 10,
  },
  continueButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 14,
    color: COLORS.textAccent,
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: "center",
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.lightPink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontFamily: FONTS.serifBold,
    fontSize: 16,
    color: COLORS.textMain,
  },
  statLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logButton: {
    flexDirection: "row",
    backgroundColor: COLORS.softPink,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  logButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.textAccent,
  },
  quoteOuter: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 8,
  },
  quoteCard: {
    backgroundColor: "#F7E9E7",
    borderRadius: 20,
    minHeight: 120,
    justifyContent: "center",
    overflow: "hidden",
  },
  quoteFlower: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 140,
    height: 120,
  },
  quoteTextWrap: {
    paddingLeft: 118,
    paddingRight: 18,
    paddingVertical: 22,
  },
  quoteText: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 19,
    color: COLORS.textAccent,
    lineHeight: 26,
  },
});
