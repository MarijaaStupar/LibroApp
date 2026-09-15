import NumberPromptModal from "@/components/NumberPromptModal";
import { resolveCoverSource } from "@/constants/bookCovers";
import { COLORS, FONTS } from "@/constants/theme";
import {
  UserBook,
  getUserBookById,
  markAsFinished,
  rateBook,
  updateCurrentPage,
} from "@/services/books";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const HERO_HEIGHT = 200;
const HERO_OVERLAP = 46;

export default function ReadingRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [book, setBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [editPageVisible, setEditPageVisible] = useState(false);
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const bookData = await getUserBookById(id);
      setBook(bookData);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  const handleMarkFinished = () => {
    if (!book) return;
    Alert.alert(
      "Mark as finished?",
      `Are you sure you finished "${book.books.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, I'm done",
          onPress: async () => {
            const updated = await markAsFinished(book.id);
            setBook(updated);
          },
        },
      ],
    );
  };

  const handleRate = async (stars: number) => {
    if (!book) return;
    const updated = await rateBook(book.id, stars);
    setBook(updated);
  };

  const comingSoonLog = () =>
    Alert.alert("Uskoro", "Log reading session isn't available yet.");

  const comingSoonThought = () =>
    Alert.alert("Uskoro", "Writing a thought isn't available yet.");

  const openDiary = () => {
    if (!book) return;
    setOptionsMenuVisible(false);
    router.push(`/diary/${book.book_id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "bottom"]}>
        <ActivityIndicator color={COLORS.primaryPink} size="large" />
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "bottom"]}>
        <Text style={styles.emptyText}>Book not found.</Text>
      </SafeAreaView>
    );
  }

  const coverSource = resolveCoverSource(
    book.books.title,
    book.books.cover_url,
  );
  const isFinished = book.status === "finished";

  return (
    <View style={styles.safe}>
      <View
        style={[
          styles.sheet,
          { marginTop: insets.top + HERO_HEIGHT - HERO_OVERLAP },
        ]}
      >
        <View
          style={[styles.sheetContent, { paddingBottom: insets.bottom + 14 }]}
        >
          <Text style={styles.title} numberOfLines={2}>
            {book.books.title}
          </Text>
          <Text style={styles.author}>{book.books.author}</Text>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${book.progress_percent}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>{book.progress_percent}%</Text>
          </View>
          <Text style={styles.pagesText}>
            {book.current_page} of {book.books.total_pages} pages
          </Text>

          <Text style={styles.sectionTitle}>Your journey</Text>

          <View style={styles.journeyRow}>
            <View style={styles.journeyBox}>
              <Text style={styles.journeyLabel}>Started</Text>
              <Text style={styles.journeyValue}>
                {book.started_at
                  ? new Date(book.started_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </Text>
            </View>
            <View style={styles.journeyBox}>
              <Text style={styles.journeyLabel}>Reading time</Text>
              <Text style={styles.journeyValue}>—</Text>
            </View>
          </View>
          <View style={styles.journeyRow}>
            <View style={styles.journeyBox}>
              <Text style={styles.journeyLabel}>Current streak</Text>
              <Text style={styles.journeyValue}>0 days</Text>
            </View>
            <View style={styles.journeyBox}>
              <Text style={styles.journeyLabel}>Average session</Text>
              <Text style={styles.journeyValue}>—</Text>
            </View>
          </View>

          <Pressable style={styles.logButton} onPress={comingSoonLog}>
            <Ionicons name="add" size={18} color={COLORS.textAccent} />
            <Text style={styles.logButtonText}>Log reading session</Text>
          </Pressable>

          <View style={styles.buttonRow}>
            <Pressable style={styles.outlineButton} onPress={comingSoonThought}>
              <Ionicons
                name="create-outline"
                size={16}
                color={COLORS.textMain}
              />
              <Text style={styles.outlineButtonText}>Write a thought</Text>
            </Pressable>
            <Pressable
              style={styles.outlineButton}
              onPress={() => setEditPageVisible(true)}
            >
              <Ionicons
                name="pencil-outline"
                size={16}
                color={COLORS.textMain}
              />
              <Text style={styles.outlineButtonText}>Update progress</Text>
            </Pressable>
          </View>

          {isFinished ? (
            <>
              <View style={styles.finishedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={styles.finishedBadgeText}>
                  Finished{" "}
                  {book.finished_at &&
                    new Date(book.finished_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                </Text>
              </View>

              <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>Rate book</Text>
                <View style={{ flexDirection: "row" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => handleRate(star)}>
                      <Ionicons
                        name={
                          (book.rating ?? 0) >= star ? "star" : "star-outline"
                        }
                        size={18}
                        color={COLORS.rating}
                        style={{ marginLeft: 3 }}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <Pressable style={styles.finishButton} onPress={handleMarkFinished}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={COLORS.primaryPink}
              />
              <Text style={styles.finishButtonText}>Mark as finished</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.hero, { top: insets.top }]} pointerEvents="box-none">
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
          </Pressable>
          <Pressable
            onPress={() => setOptionsMenuVisible(true)}
            style={styles.iconButton}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={COLORS.textMain}
            />
          </Pressable>
        </View>

        <View style={styles.coverStack}>
          <Image
            source={require("@/assets/images/book-flower.png")}
            style={styles.flowerDecoration}
            contentFit="contain"
          />
          {coverSource ? (
            <Image
              source={coverSource}
              style={styles.cover}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.cover, styles.coverFallback]}>
              <Ionicons name="book" size={36} color={COLORS.primaryPink} />
            </View>
          )}
        </View>
      </View>

      <Modal
        visible={optionsMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsMenuVisible(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setOptionsMenuVisible(false)}
        >
          <View style={[styles.menuBox, { top: insets.top + 44 }]}>
            <Pressable style={styles.menuItem} onPress={openDiary}>
              <Ionicons name="book-outline" size={16} color={COLORS.textMain} />
              <Text style={styles.menuItemText}>Book Diary</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  hero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 2,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBackdrop: { flex: 1, backgroundColor: "transparent" },
  menuBox: {
    position: "absolute",
    right: 16,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 4,
    minWidth: 150,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuItemText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textMain,
  },
  coverStack: {
    marginTop: 4,
    width: 122,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  flowerDecoration: {
    position: "absolute",
    left: -100,
    top: -20,
    width: 128,
    height: 146,
  },
  cover: {
    width: 122,
    height: 172,
    borderRadius: 5,
    backgroundColor: COLORS.softPink,
  },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  sheet: {
    flex: 1,
    marginTop: HERO_HEIGHT - HERO_OVERLAP,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: HERO_OVERLAP + 8,
    paddingBottom: 10,
    alignItems: "center",
  },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 22,
    color: COLORS.textMain,
    textAlign: "center",
  },
  author: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.progressTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryPink,
  },
  progressPercent: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.textMain,
  },
  pagesText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 18,
    color: COLORS.textMain,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  journeyRow: { flexDirection: "row", gap: 8, marginBottom: 8, width: "100%" },
  journeyBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  journeyLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  journeyValue: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 15,
    color: COLORS.textMain,
  },
  logButton: {
    flexDirection: "row",
    backgroundColor: COLORS.softPink,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    marginTop: 4,
    marginBottom: 10,
  },
  logButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 14,
    color: COLORS.textAccent,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginBottom: 10,
  },
  outlineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
  },
  outlineButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 12.5,
    color: COLORS.textMain,
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryPink,
    borderRadius: 20,
    paddingVertical: 11,
    width: "100%",
  },
  finishButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 14,
    color: COLORS.primaryPink,
  },
  finishedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  finishedBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMain,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: "100%",
  },
  rateLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMain,
  },
});
