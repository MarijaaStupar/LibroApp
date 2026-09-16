import { resolveCoverSource } from "@/constants/bookCovers";
import { COLORS, FONTS } from "@/constants/theme";
import { getBookDetails, type BookDetails } from "@/services/books";
import {
  createDiaryEntry,
  deleteDiaryEntry,
  getDiaryEntries,
  updateDiaryEntry,
  type DiaryEntry,
} from "@/services/diary";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

type LocalEntry = DiaryEntry & { editing?: boolean; isNew?: boolean };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookDiaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [book, setBook] = useState<BookDetails | null>(null);
  const [entries, setEntries] = useState<LocalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuEntry, setMenuEntry] = useState<LocalEntry | null>(null);
  const [pageDraft, setPageDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [bookData, diaryRows] = await Promise.all([
        getBookDetails(id),
        getDiaryEntries(id),
      ]);
      setBook(bookData);
      setEntries(diaryRows);
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

  const handleNewEntry = () => {
    const temp: LocalEntry = {
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      user_id: "",
      book_id: id ?? "",
      page: null,
      note: "",
      editing: true,
      isNew: true,
    };
    setEntries((prev) => [temp, ...prev]);
    setPageDraft("");
    setNoteDraft("");
  };

  const startEdit = (entry: LocalEntry) => {
    setMenuEntry(null);
    setPageDraft(entry.page != null ? String(entry.page) : "");
    setNoteDraft(entry.note ?? "");
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, editing: true } : e)),
    );
  };

  const cancelEdit = (entry: LocalEntry) => {
    if (entry.isNew) {
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      return;
    }
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, editing: false } : e)),
    );
  };

  const handleSaveEntry = async (entry: LocalEntry) => {
    if (!id) return;
    const pageNum = pageDraft.trim() ? parseInt(pageDraft, 10) : null;
    setSaving(true);
    try {
      if (entry.isNew) {
        const created = await createDiaryEntry(id, pageNum, noteDraft.trim());
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? created : e)),
        );
      } else {
        const updated = await updateDiaryEntry(
          entry.id,
          pageNum,
          noteDraft.trim(),
        );
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? updated : e)),
        );
      }
    } catch (e: any) {
      Alert.alert("Greška", e.message ?? "Nije uspelo čuvanje unosa.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (entry: LocalEntry) => {
    setMenuEntry(null);
    Alert.alert("Obriši unos", "Da li sigurno želiš da obrišeš ovaj unos?", [
      { text: "Otkaži", style: "cancel" },
      {
        text: "Obriši",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDiaryEntry(entry.id);
            setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          } catch (e: any) {
            Alert.alert("Greška", e.message ?? "Nije uspelo brisanje.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "bottom"]}>
        <ActivityIndicator color={COLORS.primaryPink} size="large" />
      </SafeAreaView>
    );
  }

  const cover = book ? resolveCoverSource(book.title, book.cover_url) : null;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={26} color={COLORS.textMain} />
        </Pressable>
        <Text style={styles.headerTitle}>Book Diary</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.bookRow}>
        {cover ? (
          <Image source={cover} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Ionicons name="book" size={22} color={COLORS.primaryPink} />
          </View>
        )}
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {book?.title ?? ""}
          </Text>
          <Text style={styles.bookAuthor}>{book?.author}</Text>

          <Pressable style={styles.newEntryButton} onPress={handleNewEntry}>
            <Ionicons name="add" size={16} color={COLORS.white} />
            <Text style={styles.newEntryText}>New entry</Text>
          </Pressable>
        </View>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No entries yet!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            item.editing ? (
              <View style={styles.entryCard}>
                <Text style={styles.entryDate}>
                  {formatDate(item.created_at)}
                </Text>

                <View style={styles.editRow}>
                  <Text style={styles.pagePrefix}>p.</Text>
                  <TextInput
                    style={styles.pageInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="number-pad"
                    value={pageDraft}
                    onChangeText={setPageDraft}
                  />
                </View>

                <TextInput
                  style={styles.noteInput}
                  placeholder="Write your thoughts..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={noteDraft}
                  onChangeText={setNoteDraft}
                  multiline
                />

                <View style={styles.editButtonRow}>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => cancelEdit(item)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.saveButton, saving && { opacity: 0.6 }]}
                    onPress={() => handleSaveEntry(item)}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.saveText}>Save</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.entryCard}>
                <View style={styles.entryTopRow}>
                  <View style={styles.entryTopLeft}>
                    <Text style={styles.entryDate}>
                      {formatDate(item.created_at)}
                    </Text>
                    {item.page != null && (
                      <Text style={styles.entryPage}>p.{item.page}</Text>
                    )}
                  </View>
                  <Pressable
                    style={styles.dotsButton}
                    onPress={() => setMenuEntry(item)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  </Pressable>
                </View>
                {!!item.note && (
                  <Text style={styles.entryNote}>{item.note}</Text>
                )}
              </View>
            )
          }
        />
      )}

      <Modal
        visible={!!menuEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuEntry(null)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuEntry(null)}
        >
          <View style={styles.menuBox}>
            <Pressable
              style={styles.menuItem}
              onPress={() => menuEntry && startEdit(menuEntry)}
            >
              <Ionicons
                name="create-outline"
                size={17}
                color={COLORS.textMain}
              />
              <Text style={styles.menuItemText}>Edit</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => menuEntry && handleDelete(menuEntry)}
            >
              <Ionicons name="trash-outline" size={17} color="#C0392B" />
              <Text style={[styles.menuItemText, { color: "#C0392B" }]}>
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
    fontFamily: FONTS.serifBold,
    fontSize: 26,
    color: COLORS.textMain,
  },
  bookRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  cover: {
    width: 84,
    height: 122,
    borderRadius: 6,
    backgroundColor: COLORS.softPink,
  },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  bookInfo: { flex: 1, marginLeft: 14, justifyContent: "center" },
  bookTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 18,
    color: COLORS.textMain,
  },
  bookAuthor: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  newEntryButton: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryPink,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 65,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 19,
  },
  newEntryText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 14,
    color: COLORS.white,
  },
  emptyWrap: { alignItems: "center", marginTop: 60 },
  emptyText: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 20,
    color: COLORS.textMain,
  },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  entryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  entryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  entryTopLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  entryDate: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  entryPage: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  dotsButton: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  entryNote: {
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textMain,
    lineHeight: 21,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  pagePrefix: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  pageInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 64,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textMain,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 70,
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textMain,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  editButtonRow: { flexDirection: "row", gap: 10 },
  cancelButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textMain,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: COLORS.primaryPink,
  },
  saveText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 14,
    color: COLORS.white,
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
    minWidth: 180,
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
