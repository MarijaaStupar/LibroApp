import BookPickerModal from "@/components/BookPickerModal";
import { resolveCoverSource } from "@/constants/bookCovers";
import { COLORS, FONTS } from "@/constants/theme";
import type { BookCatalog } from "@/services/books";
import {
  addBooksToCollection,
  getCollectionBooks,
  getCollectionById,
  type Collection,
} from "@/services/collections";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [books, setBooks] = useState<BookCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [collectionData, bookRows] = await Promise.all([
        getCollectionById(id),
        getCollectionBooks(id),
      ]);
      setCollection(collectionData);
      setBooks(bookRows);
    } catch (e: any) {
      Alert.alert("Greška", e.message ?? "Nešto je pošlo po zlu.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "bottom"]}>
        <ActivityIndicator color={COLORS.primaryPink} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {collection?.name ?? "Collection"}
        </Text>
        <View style={styles.iconButton} />
      </View>

      <Pressable
        style={styles.addBooksButton}
        onPress={() => setPickerVisible(true)}
      >
        <Ionicons name="add" size={18} color={COLORS.textAccent} />
        <Text style={styles.addBooksText}>Add books</Text>
      </Pressable>

      {books.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No books here yet!</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const cover = resolveCoverSource(item.title, item.cover_url);
            return (
              <Pressable
                style={styles.row}
                onPress={() => router.push(`/book/${item.id}`)}
              >
                {cover ? (
                  <Image
                    source={cover}
                    style={styles.cover}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.cover, styles.coverFallback]}>
                    <Ionicons
                      name="book"
                      size={22}
                      color={COLORS.primaryPink}
                    />
                  </View>
                )}
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.rowAuthor}>{item.author}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <BookPickerModal
        visible={pickerVisible}
        excludeIds={books.map((b) => b.id)}
        onCancel={() => setPickerVisible(false)}
        onDone={async (picked) => {
          setPickerVisible(false);
          if (!id || picked.length === 0) return;
          await addBooksToCollection(
            id,
            picked.map((b) => b.id),
          );
          load();
        }}
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
    paddingHorizontal: 12,
    marginTop: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 19,
    color: COLORS.textMain,
    textAlign: "center",
  },
  addBooksButton: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightPink,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 12,
    gap: 4,
  },
  addBooksText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.textAccent,
  },
  emptyWrap: { alignItems: "center", marginTop: 60 },
  emptyText: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 20,
    color: COLORS.textMain,
  },
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  row: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  cover: {
    width: 54,
    height: 78,
    borderRadius: 4,
    backgroundColor: COLORS.softPink,
  },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  rowTitle: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 15,
    color: COLORS.textMain,
  },
  rowAuthor: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
});
