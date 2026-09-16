import { resolveCoverSource } from "@/constants/bookCovers";
import { COLORS, FONTS } from "@/constants/theme";
import { getBookDetails, type BookDetails } from "@/services/books";
import {
  getBookCollectionIds,
  getUserCollections,
  setBookStatus,
  statusForCollection,
  toggleBookInCollection,
  type Collection,
} from "@/services/collections";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
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

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);

  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBookDetails(id)
      .then(setBook)
      .catch(() => Alert.alert("Greška", "Nije uspelo učitavanje knjige."))
      .finally(() => setLoading(false));
  }, [id]);

  const openCollectionModal = async () => {
    if (!id) return;
    setCollectionModalVisible(true);
    setCollectionsLoading(true);
    try {
      const cols = await getUserCollections();
      setCollections(cols);
      const ids = await getBookCollectionIds(
        id,
        cols.map((c) => c.id),
      );
      setSelectedIds(ids);
    } catch {
      Alert.alert("Greška", "Nije uspelo učitavanje kolekcija.");
    } finally {
      setCollectionsLoading(false);
    }
  };

  const handleToggleCollection = async (collection: Collection) => {
    if (!id) return;
    const already = selectedIds.has(collection.id);
    try {
      await toggleBookInCollection(collection.id, id, already);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (already) next.delete(collection.id);
        else next.add(collection.id);
        return next;
      });

      const status = statusForCollection(collection.name);
      if (!already && status) {
        await setBookStatus(id, status);
      }
    } catch {
      Alert.alert("Greška", "Nije uspelo čuvanje. Pokušaj ponovo.");
    }
  };

  const comingSoonStart = () =>
    Alert.alert("Uskoro", "Otvaranje knjige za čitanje biće uskoro dostupno.");

  const handleShare = async () => {
    if (!book) return;
    try {
      await Share.share({
        message: `Čitam "${book.title}" od ${book.author} 📖 Pratim sve svoje knjige u Libro aplikaciji!`,
      });
    } catch {}
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
        <Text style={styles.emptyText}>Knjiga nije pronađena.</Text>
      </SafeAreaView>
    );
  }

  const coverSource = resolveCoverSource(book.title, book.cover_url);
  const genres = book.genres ?? [];
  const moods = book.subjects ?? [];
  const publishedYear = book.published_date
    ? book.published_date.slice(0, 4)
    : null;

  return (
    <View style={styles.safe}>
      <View
        style={[
          styles.sheet,
          { marginTop: insets.top + HERO_HEIGHT - HERO_OVERLAP },
        ]}
      >
        <View
          style={[styles.sheetContent, { paddingBottom: insets.bottom + 16 }]}
        >
          <Text style={styles.title}>{book.title}</Text>
          {book.author ? (
            <Text style={styles.author}>{book.author}</Text>
          ) : null}

          {book.average_rating ? (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={
                    book.average_rating! >= star
                      ? "star"
                      : book.average_rating! >= star - 0.5
                        ? "star-half"
                        : "star-outline"
                  }
                  size={15}
                  color={COLORS.rating}
                />
              ))}
              <Text style={styles.ratingValue}>
                {book.average_rating.toFixed(2)}
              </Text>
              {book.ratings_count ? (
                <Text style={styles.ratingCount}>
                  ({book.ratings_count.toLocaleString("en-US")} ratings)
                </Text>
              ) : null}
            </View>
          ) : null}

          {genres.length > 0 && (
            <View style={styles.pillRow}>
              {genres.slice(0, 3).map((genre) => (
                <View key={genre} style={styles.genrePill}>
                  <Text style={styles.pillText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.statsBox}>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{book.total_pages || "—"}</Text>
              <Text style={styles.statLabel}>pages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{publishedYear || "—"}</Text>
              <Text style={styles.statLabel}>published</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>
                {book.average_rating ? book.average_rating.toFixed(2) : "—"}
              </Text>
              <Text style={styles.statLabel}>rating</Text>
            </View>
          </View>

          {moods.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Reading mood?</Text>
              <View style={styles.pillRow}>
                {moods.slice(0, 3).map((mood) => (
                  <View key={mood} style={styles.moodPill}>
                    <Text style={styles.pillText}>{mood}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {book.description ? (
            <>
              <Text style={styles.sectionTitle}>The story:</Text>
              <View style={styles.storyBox}>
                <ScrollView
                  style={styles.storyScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <Text
                    style={styles.storyText}
                    numberOfLines={descExpanded ? undefined : 4}
                  >
                    {book.description}
                  </Text>
                </ScrollView>
                <Pressable onPress={() => setDescExpanded((v) => !v)}>
                  <Text style={styles.readMore}>
                    {descExpanded ? "Read less" : "Read more"}{" "}
                    <Ionicons
                      name={descExpanded ? "chevron-up" : "chevron-down"}
                      size={13}
                      color={COLORS.darkPink}
                    />
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.collectionButton}
              onPress={openCollectionModal}
            >
              <Ionicons
                name="heart-outline"
                size={18}
                color={COLORS.textMain}
              />
              <Text style={styles.collectionButtonText}>
                Add to{"\n"}collection
              </Text>
            </Pressable>
            <Pressable style={styles.startButton} onPress={comingSoonStart}>
              <Text style={styles.startButtonText}>Start reading</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.hero, { top: insets.top }]} pointerEvents="box-none">
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
          </Pressable>
          <Pressable onPress={handleShare} style={styles.iconButton}>
            <Ionicons name="share-outline" size={22} color={COLORS.textMain} />
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
        visible={collectionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCollectionModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCollectionModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add to collection</Text>
            {collectionsLoading ? (
              <ActivityIndicator
                color={COLORS.primaryPink}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {collections.map((collection) => {
                  const checked = selectedIds.has(collection.id);
                  return (
                    <Pressable
                      key={collection.id}
                      style={styles.modalRow}
                      onPress={() => handleToggleCollection(collection)}
                    >
                      <Text style={styles.modalRowText}>{collection.name}</Text>
                      <Ionicons
                        name={checked ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={checked ? COLORS.primaryPink : COLORS.border}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
            <Pressable
              style={styles.modalDoneButton}
              onPress={() => setCollectionModalVisible(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 6,
  },
  ratingValue: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.textMain,
    marginLeft: 6,
  },
  ratingCount: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginBottom: 8,
  },
  genrePill: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  moodPill: {
    backgroundColor: COLORS.lightPink,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textMain,
  },
  statsBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 9,
    width: "100%",
    marginBottom: 8,
  },
  statCol: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  statValue: {
    fontFamily: FONTS.serifBold,
    fontSize: 20,
    color: COLORS.textMain,
  },
  statLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  sectionTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 22,
    color: COLORS.textMain,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  storyBox: {
    flex: 1,
    minHeight: 64,
    width: "100%",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  storyScroll: {
    flex: 1,
  },
  storyText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMain,
    lineHeight: 17,
  },
  readMore: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.darkPink,
    marginTop: 4,
  },
  buttonRow: { flexDirection: "row", gap: 10, width: "100%" },
  collectionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 9,
    backgroundColor: COLORS.card,
  },
  collectionButtonText: {
    fontFamily: FONTS.serifMedium,
    fontSize: 13,
    color: COLORS.textMain,
    textAlign: "center",
    lineHeight: 16,
  },
  startButton: {
    flex: 1,
    backgroundColor: COLORS.primaryPink,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 14,
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(51,38,40,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 20,
    color: COLORS.textMain,
    textAlign: "center",
    marginBottom: 14,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalRowText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.textMain,
  },
  modalDoneButton: {
    marginTop: 16,
    backgroundColor: COLORS.softPink,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalDoneText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.textAccent,
  },
});
