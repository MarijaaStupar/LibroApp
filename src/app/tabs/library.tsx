import { resolveCoverSource } from "@/constants/bookCovers";
import { COLORS, FONTS } from "@/constants/theme";
import { UserBook, getAllUserBooks, removeUserBook } from "@/services/books";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type FilterKey = "all" | "reading" | "finished" | "want_to_read";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reading", label: "Reading" },
  { key: "finished", label: "Finished" },
  { key: "want_to_read", label: "Saved" },
];

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuBook, setMenuBook] = useState<UserBook | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getAllUserBooks();
      setBooks(data);
    } catch (e: any) {
      Alert.alert("Greška", e.message ?? "Nije uspelo učitavanje knjiga.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filtered = useMemo(() => {
    let list = books;
    if (activeFilter !== "all") {
      list = list.filter((b) => b.status === activeFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.books.title.toLowerCase().includes(q) ||
          (b.books.author ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [books, activeFilter, searchQuery]);

  const handleRemove = (book: UserBook) => {
    setMenuBook(null);
    Alert.alert(
      "Remove from library?",
      `Remove "${book.books.title}" from your library?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeUserBook(book.id);
              setBooks((prev) => prev.filter((b) => b.id !== book.id));
            } catch (e: any) {
              Alert.alert("Greška", e.message ?? "Nije uspelo brisanje.");
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: UserBook }) => {
    const coverSource = resolveCoverSource(
      item.books.title,
      item.books.cover_url,
    );

    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/reading-room/${item.id}`)}
      >
        {coverSource ? (
          <Image source={coverSource} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Ionicons name="book" size={22} color={COLORS.primaryPink} />
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookTitle} numberOfLines={2}>
                {item.books.title}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {item.books.author}
              </Text>
            </View>
            <Pressable
              style={styles.dotsButton}
              onPress={() => setMenuBook(item)}
              hitSlop={8}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={COLORS.textSecondary}
              />
            </Pressable>
          </View>

          {item.status === "finished" ? (
            <View style={styles.finishedRow}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={COLORS.success}
              />
              <Text style={styles.finishedText}>Finished</Text>
            </View>
          ) : item.status === "want_to_read" ? (
            <View style={styles.savedRow}>
              <Ionicons name="bookmark" size={13} color={COLORS.primaryPink} />
              <Text style={styles.savedText}>Saved</Text>
            </View>
          ) : (
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${item.progress_percent}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>
                {item.progress_percent}%
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>My library</Text>
          <View style={styles.headerIcons}>
            <Pressable
              style={styles.iconButton}
              onPress={() => setSearchVisible((v) => !v)}
            >
              <Ionicons name="search" size={20} color={COLORS.textMain} />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push("/collections")}
            >
              <Ionicons name="library" size={20} color={COLORS.textMain} />
            </Pressable>
          </View>
        </View>

        {searchVisible && (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your library..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.primaryPink} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No books yet!</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
          />
        )}
      </View>

      <Modal
        visible={!!menuBook}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuBook(null)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuBook(null)}
        >
          <View style={styles.menuBox}>
            <Pressable
              style={styles.menuItem}
              onPress={() => menuBook && handleRemove(menuBook)}
            >
              <Ionicons name="trash-outline" size={16} color="#C0392B" />
              <Text style={[styles.menuItemText, { color: "#C0392B" }]}>
                Remove from library
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 6 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 30,
    color: COLORS.textMain,
  },
  headerIcons: { flexDirection: "row", gap: 6 },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textMain,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryPink,
  },
  filterChipText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMain,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  emptyText: {
    fontFamily: FONTS.serifMediumItalic,
    fontSize: 18,
    color: COLORS.textMain,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  cover: {
    width: 64,
    height: 94,
    borderRadius: 6,
    backgroundColor: COLORS.softPink,
  },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1, marginLeft: 12, justifyContent: "center" },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start" },
  bookTitle: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 16,
    color: COLORS.textMain,
  },
  bookAuthor: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dotsButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.progressTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryPink,
  },
  progressPercent: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 12,
    color: COLORS.textMain,
  },
  finishedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  finishedText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMain,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  savedText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.primaryPink,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(51,38,40,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuBox: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 4,
    minWidth: 220,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textMain,
  },
});
