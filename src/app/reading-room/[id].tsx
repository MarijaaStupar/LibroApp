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
    Pressable,
    ScrollView,
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

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const bookData = await getUserBookById(id);
      setBook(bookData);
    } catch (e: any) {
      Alert.alert("Greška", e.message ?? "Nešto je pošlo po zlu.");
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
      `Da li si sigurna da si završila "${book.books.title}"?`,
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Da, gotova sam",
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

  const comingSoon = () =>
    Alert.alert("Uskoro", "Ova funkcija još nije dostupna.");

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
        <Text style={styles.emptyText}>Knjiga nije pronađena.</Text>
      </SafeAreaView>
    );
  }

  const coverSource = resolveCoverSource(
    book.books.title,
    book.books.cover_url,
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
        </Pressable>
        <Pressable
          style={styles.diaryButton}
          onPress={() => router.push(`/diary/${book.book_id}`)}
        >
          <Ionicons name="book-outline" size={16} color={COLORS.textMain} />
          <Text style={styles.diaryButtonText}>Book Diary</Text>
        </Pressable>
        <Pressable onPress={comingSoon} style={styles.iconButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color={COLORS.textMain}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverWrap}>
          {coverSource ? (
            <Image
              source={coverSource}
              style={styles.cover}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.cover, styles.coverFallback]}>
              <Ionicons name="book" size={40} color={COLORS.primaryPink} />
            </View>
          )}
        </View>

        <Text style={styles.title}>{book.books.title}</Text>
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
            <Ionicons name="pencil" size={13} color={COLORS.textSecondary} />
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Your journey</Text>

        <View style={styles.journeyBox}>
          <Text style={styles.journeyLabel}>Started</Text>
          <Text style={styles.journeyValue}>
            {book.started_at
              ? new Date(book.started_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}
          </Text>
        </View>

        <Pressable style={styles.comingSoonButton} onPress={comingSoon}>
          <Ionicons
            name="time-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.comingSoonButtonText}>
            Reading time & sessions – coming soon
          </Text>
        </Pressable>

        <View style={styles.smallButtonRow}>
          <Pressable style={styles.smallButton} onPress={comingSoon}>
            <Ionicons name="create-outline" size={16} color={COLORS.textMain} />
            <Text style={styles.smallButtonText}>Write a thought</Text>
          </Pressable>
          <Pressable
            style={styles.smallButton}
            onPress={() => setEditPageVisible(true)}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.textMain} />
            <Text style={styles.smallButtonText}>Update progress</Text>
          </Pressable>
        </View>

        {book.status !== "finished" ? (
          <Pressable style={styles.finishButton} onPress={handleMarkFinished}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={COLORS.primaryPink}
            />
            <Text style={styles.finishButtonText}>Mark as finished</Text>
          </Pressable>
        ) : (
          <View style={styles.finishedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={18}
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
        )}

        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Rate book:</Text>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => handleRate(star)}>
              <Ionicons
                name={(book.rating ?? 0) >= star ? "star" : "star-outline"}
                size={20}
                color={COLORS.rating}
                style={{ marginLeft: 4 }}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

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
    paddingTop: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  diaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
  },
  diaryButtonText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMain,
  },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  coverWrap: { alignItems: "center", marginTop: 12, marginBottom: 18 },
  cover: {
    width: 150,
    height: 214,
    borderRadius: 4,
    backgroundColor: COLORS.softPink,
  },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 22,
    color: COLORS.textMain,
    textAlign: "center",
  },
  author: {
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 18,
  },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
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
    fontSize: 14,
    color: COLORS.textMain,
    width: 40,
    textAlign: "right",
  },
  pagesText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 19,
    color: COLORS.textMain,
    marginBottom: 12,
  },
  journeyBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  journeyLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  journeyValue: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 16,
    color: COLORS.textMain,
  },
  comingSoonButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 14,
  },
  comingSoonButtonText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  smallButtonRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  smallButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 12,
  },
  smallButtonText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMain,
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryPink,
    borderRadius: 24,
    paddingVertical: 14,
    marginBottom: 16,
  },
  finishButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.primaryPink,
  },
  finishedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  finishedBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textMain,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rateLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textMain,
    marginRight: 6,
  },
  emptyText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
