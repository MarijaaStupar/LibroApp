import { resolveCoverSource } from "@/constants/bookCovers";
import { COLORS, FONTS } from "@/constants/theme";
import type { BookCatalog } from "@/services/books";
import { searchCatalog } from "@/services/explore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  excludeIds?: string[];
  onCancel: () => void;
  onDone: (selected: BookCatalog[]) => void;
};

export default function BookPickerModal({
  visible,
  excludeIds = [],
  onCancel,
  onDone,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Map<string, BookCatalog>>(new Map());

  useEffect(() => {
    if (!visible) {
      setQuery("");
      setResults([]);
      setSelected(new Map());
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const books = await searchCatalog(q);
        if (active) {
          setResults(books.filter((b) => !excludeIds.includes(b.id)));
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query, visible]);

  const toggle = (book: BookCatalog) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(book.id)) next.delete(book.id);
      else next.set(book.id, book);
      return next;
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Choose books</Text>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={17} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title or author"
              placeholderTextColor={COLORS.textSecondary}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {loading ? (
            <ActivityIndicator
              color={COLORS.primaryPink}
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                query.trim() ? (
                  <Text style={styles.emptyText}>No books found.</Text>
                ) : null
              }
              renderItem={({ item }) => {
                const isSelected = selected.has(item.id);
                const cover = resolveCoverSource(item.title, item.cover_url);
                return (
                  <Pressable
                    style={styles.row}
                    onPress={() => toggle(item)}
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
                          size={18}
                          color={COLORS.primaryPink}
                        />
                      </View>
                    )}
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.rowAuthor} numberOfLines={1}>
                        {item.author}
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                      size={22}
                      color={
                        isSelected ? COLORS.primaryPink : COLORS.border
                      }
                    />
                  </Pressable>
                );
              }}
            />
          )}

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.doneButton}
              onPress={() => onDone(Array.from(selected.values()))}
            >
              <Text style={styles.doneText}>
                Done{selected.size > 0 ? ` (${selected.size})` : ""}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(51,38,40,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: "75%",
  },
  title: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 20,
    color: COLORS.textMain,
    textAlign: "center",
    marginBottom: 14,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textMain,
  },
  list: { flex: 1 },
  emptyText: {
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  cover: {
    width: 36,
    height: 52,
    borderRadius: 4,
    backgroundColor: COLORS.softPink,
  },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  rowTitle: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 15,
    color: COLORS.textMain,
  },
  rowAuthor: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.textMain,
  },
  doneButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 24,
    alignItems: "center",
    backgroundColor: COLORS.primaryPink,
  },
  doneText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.white,
  },
});
