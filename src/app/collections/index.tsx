import { COLORS, FONTS } from "@/constants/theme";
import {
  Collection,
  deleteCollection,
  getCollectionBookCounts,
  getUserCollections,
  updateCollectionName,
} from "@/services/collections";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
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

export default function CollectionsScreen() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"mine" | "shared">("mine");

  const [menuCollection, setMenuCollection] = useState<Collection | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const cols = await getUserCollections();
      setCollections(cols);
      const c = await getCollectionBookCounts(cols.map((c) => c.id));
      setCounts(c);
    } catch (e: any) {
      Alert.alert("Greška", e.message ?? "Nije uspelo učitavanje kolekcija.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const comingSoonShared = () =>
    Alert.alert("Uskoro", "Deljene kolekcije još nisu dostupne.");

  const comingSoonPhoto = () =>
    Alert.alert(
      "Uskoro",
      "Menjanje fotografije kolekcije biće dostupno kad dodamo pristup kameri/galeriji.",
    );

  const openEdit = (collection: Collection) => {
    setMenuCollection(null);
    setEditingCollection(collection);
    setEditName(collection.name);
  };

  const handleSaveEdit = async () => {
    if (!editingCollection) return;
    if (!editName.trim()) {
      Alert.alert("Nedostaje naziv", "Unesi naziv kolekcije.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateCollectionName(
        editingCollection.id,
        editName.trim(),
      );
      setCollections((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      setEditingCollection(null);
    } catch (e: any) {
      Alert.alert("Greška", e.message ?? "Nije uspelo čuvanje izmena.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (collection: Collection) => {
    setMenuCollection(null);
    Alert.alert(
      "Obriši kolekciju",
      `Da li sigurno želiš da obrišeš "${collection.name}"?`,
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Obriši",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCollection(collection.id);
              setCollections((prev) =>
                prev.filter((c) => c.id !== collection.id),
              );
            } catch (e: any) {
              Alert.alert("Greška", e.message ?? "Nije uspelo brisanje.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Collections</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/collections/new")}
          >
            <Ionicons name="add" size={26} color={COLORS.textMain} />
          </Pressable>
        </View>

        <View style={styles.tabsRow}>
          <Pressable
            style={[styles.tab, tab === "mine" && styles.tabActive]}
            onPress={() => setTab("mine")}
          >
            <Text
              style={[styles.tabText, tab === "mine" && styles.tabTextActive]}
            >
              My Collections
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === "shared" && styles.tabActive]}
            onPress={() => {
              setTab("shared");
              comingSoonShared();
            }}
          >
            <Text
              style={[styles.tabText, tab === "shared" && styles.tabTextActive]}
            >
              Shared
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.primaryPink} size="large" />
          </View>
        ) : tab === "shared" ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No shared collections yet!</Text>
          </View>
        ) : collections.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No collections yet!</Text>
          </View>
        ) : (
          <FlatList
            data={collections}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/collections/${item.id}`)}
              >
                {item.cover_url ? (
                  <Image
                    source={{ uri: item.cover_url }}
                    style={styles.cover}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.cover, styles.coverFallback]}>
                    <Ionicons
                      name="book-outline"
                      size={30}
                      color={COLORS.primaryPink}
                    />
                  </View>
                )}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.cardBottomRow}>
                    <Text style={styles.cardCount}>
                      {counts[item.id] ?? 0}{" "}
                      {(counts[item.id] ?? 0) === 1 ? "book" : "books"}
                    </Text>
                    <Pressable
                      style={styles.dotsButton}
                      onPress={() => setMenuCollection(item)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={18}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

      <Modal
        visible={!!menuCollection}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuCollection(null)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuCollection(null)}
        >
          <View style={styles.menuBox}>
            <Pressable
              style={styles.menuItem}
              onPress={() => menuCollection && openEdit(menuCollection)}
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
              onPress={() => menuCollection && handleDelete(menuCollection)}
            >
              <Ionicons name="trash-outline" size={17} color="#C0392B" />
              <Text style={[styles.menuItemText, { color: "#C0392B" }]}>
                Delete
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={!!editingCollection}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingCollection(null)}
      >
        <Pressable
          style={styles.editBackdrop}
          onPress={() => setEditingCollection(null)}
        >
          <Pressable style={styles.editCard} onPress={() => {}}>
            <Text style={styles.editTitle}>Edit collection</Text>

            <View style={styles.fieldRow}>
              <Ionicons
                name="book-outline"
                size={18}
                color={COLORS.textSecondary}
              />
              <TextInput
                style={styles.fieldInput}
                placeholder="Collection Name"
                placeholderTextColor={COLORS.textSecondary}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <Pressable style={styles.photoRow} onPress={comingSoonPhoto}>
              <Ionicons name="add" size={18} color={COLORS.textAccent} />
              <Text style={styles.photoText}>Pick a photo</Text>
            </Pressable>

            <View style={styles.editButtonRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setEditingCollection(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, saving && { opacity: 0.6 }]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
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
  addButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 20,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 16,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.card,
  },
  tabText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textMain,
    fontFamily: FONTS.sansSemiBold,
  },
  emptyText: {
    fontFamily: FONTS.serifMediumItalic,
    fontSize: 18,
    color: COLORS.textMain,
  },
  list: { paddingBottom: 30 },
  row: { justifyContent: "space-between", marginBottom: 16 },
  card: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: "hidden",
    paddingBottom: 10,
  },
  cover: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.softPink,
    marginBottom: 8,
  },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  cardFooter: {
    paddingHorizontal: 10,
  },
  cardName: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 16,
    color: COLORS.textMain,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  cardCount: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dotsButton: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
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
    minWidth: 200,
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
  editBackdrop: {
    flex: 1,
    backgroundColor: "rgba(51,38,40,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  editCard: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
  },
  editTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 19,
    color: COLORS.textMain,
    textAlign: "center",
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
  },
  fieldInput: {
    flex: 1,
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textAccent,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.lightPink,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  photoText: {
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textAccent,
  },
  editButtonRow: { flexDirection: "row", gap: 12 },
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
  saveButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 24,
    alignItems: "center",
    backgroundColor: COLORS.primaryPink,
  },
  saveText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.white,
  },
});
