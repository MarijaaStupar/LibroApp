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
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReadingRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
    Alert.alert("Coming soon", "Log reading session isn't available yet.");

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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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

      <View style={styles.content}>
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

        <Pressable onPress={() => setEditPageVisible(true)}>
          <Text style={styles.pagesText}>
            {book.current_page} of {book.books.total_pages} pages{" "}
            <Ionicons name="pencil" size={12} color={COLORS.textSecondary} />
          </Text>
        </Pressable>

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
          <Pressable
            style={styles.finishButtonSmall}
            onPress={handleMarkFinished}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={15}
              color={COLORS.primaryPink}
            />
            <Text style={styles.finishButtonSmallText}>Mark as finished</Text>
          </Pressable>
        )}
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
          <View style={styles.menuBox}>
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 2 },
  coverStack: {
    width: "100%",
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  flowerDecoration: {
    position: "absolute",
    left: 26,
    top: 4,
    width: 128,
    height: 148,
  },
  cover: {
    width: 100,
    height: 144,
    borderRadius: 4,
    backgroundColor: COLORS.softPink,
  },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 20,
    color: COLORS.textMain,
    textAlign: "center",
    marginTop: 4,
  },
  author: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
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
    fontSize: 12,
    color: COLORS.textMain,
  },
  pagesText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 16,
    color: COLORS.textMain,
    marginBottom: 8,
  },
  journeyRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  journeyBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 8,
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
    fontSize: 14,
    color: COLORS.textMain,
  },
  logButton: {
    flexDirection: "row",
    backgroundColor: COLORS.softPink,
    borderRadius: 24,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 2,
    marginBottom: 10,
  },
  logButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 14,
    color: COLORS.textAccent,
  },
  finishButtonSmall: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryPink,
    borderRadius: 18,
    paddingVertical: 8,
  },
  finishButtonSmallText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
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
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  rateLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMain,
  },
  emptyText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  menuBackdrop: { flex: 1, backgroundColor: "transparent" },
  menuBox: {
    position: "absolute",
    top: 54,
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
});
