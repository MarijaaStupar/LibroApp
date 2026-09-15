import BookPickerModal from "@/components/BookPickerModal";
import { COLORS, FONTS } from "@/constants/theme";
import type { BookCatalog } from "@/services/books";
import { addBooksToCollection, createCollection } from "@/services/collections";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewCollectionScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<BookCatalog[]>([]);
  const [saving, setSaving] = useState(false);

  const comingSoonPhoto = () =>
    Alert.alert(
      "Uskoro",
      "Biranje fotografije iz galerije biće dostupno kad dodamo pristup kameri/galeriji.",
    );

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Nedostaje naziv", "Unesi naziv kolekcije.");
      return;
    }
    setSaving(true);
    try {
      const created = await createCollection(name.trim());
      if (selectedBooks.length > 0) {
        await addBooksToCollection(
          created.id,
          selectedBooks.map((b) => b.id),
        );
      }
      router.replace(`/collections/${created.id}`);
    } catch (e: any) {
      Alert.alert("Greška", e.message ?? "Nije uspelo kreiranje kolekcije.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
        </Pressable>
        <Text style={styles.headerTitle}>New Collection</Text>
        <View style={styles.iconButton} />
      </View>

      <View style={styles.content}>
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
            value={name}
            onChangeText={setName}
          />
        </View>

        <Pressable style={styles.photoRow} onPress={comingSoonPhoto}>
          <Ionicons name="add" size={18} color={COLORS.textAccent} />
          <Text style={styles.photoText}>Pick a photo</Text>
        </Pressable>

        <Pressable
          style={styles.fieldRow}
          onPress={() => setPickerVisible(true)}
        >
          <Ionicons name="add" size={18} color={COLORS.textSecondary} />
          <Text style={styles.chooseBooksText}>
            {selectedBooks.length > 0
              ? `${selectedBooks.length} book${selectedBooks.length > 1 ? "s" : ""} selected`
              : "Choose books"}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.createButton, saving && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.createButtonText}>Create collection</Text>
          )}
        </Pressable>
      </View>

      <BookPickerModal
        visible={pickerVisible}
        onCancel={() => setPickerVisible(false)}
        onDone={(picked) => {
          setSelectedBooks(picked);
          setPickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
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
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 19,
    color: COLORS.textMain,
  },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 14,
  },
  fieldInput: {
    flex: 1,
    fontFamily: FONTS.serifMedium,
    fontSize: 16,
    color: COLORS.textAccent,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.lightPink,
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 14,
  },
  photoText: {
    fontFamily: FONTS.serifMedium,
    fontSize: 16,
    color: COLORS.textAccent,
  },
  chooseBooksText: {
    fontFamily: FONTS.serifMedium,
    fontSize: 16,
    color: COLORS.textAccent,
  },
  createButton: {
    backgroundColor: COLORS.primaryPink,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.white,
  },
});
