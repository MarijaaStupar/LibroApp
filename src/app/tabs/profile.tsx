import { COLORS, FONTS } from "@/constants/theme";
import { getAllUserBooks } from "@/services/books";
import {
  getMyProfile,
  updateMyAvatar,
  updateMyBio,
} from "@/services/profile";
import { supabase } from "@/services/supabase";
import {
  isReadingReminderEnabled,
  setReadingReminder,
} from "@/services/notifications";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const LINKS = [
  { key: "achievements", label: "Achievements", icon: "trophy-outline" },
  { key: "collections", label: "My collections", icon: "library-outline" },
  { key: "diary", label: "Reading diary", icon: "book-outline" },
  { key: "goal", label: "Reading goal", icon: "checkmark-circle-outline" },
  { key: "friends", label: "Friends", icon: "person-outline" },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Reader");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [booksCount, setBooksCount] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [bioEditVisible, setBioEditVisible] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      setName(profile.name);
      setUsername(profile.username);
      setBio(profile.bio);
      setAvatarUrl(profile.avatarUrl);

      const books = await getAllUserBooks();
      const finished = books.filter((b) => b.status === "finished");
      setBooksCount(finished.length);
      setPagesCount(
        finished.reduce((sum, b) => sum + (b.books?.total_pages ?? 0), 0),
      );

      setReminderEnabled(await isReadingReminderEnabled());
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const comingSoon = () =>
    Alert.alert("Uskoro", "Ova funkcionalnost još nije dostupna.");

  const saveAvatar = async (uri: string) => {
    try {
      // Napomena: slika se čuva samo lokalno (bez Supabase Storage-a) zbog
      // vremenskog pritiska pred odbranu - RLS na storage.objects je
      // odbijao upload i pored ispravno podešenih pravila.
      await updateMyAvatar(uri);
      setAvatarUrl(uri);
    } catch (e: any) {
      Alert.alert("Greška", e.message ?? "Nije uspelo čuvanje slike.");
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Nema dozvole",
        "Dozvoli pristup kameri u podešavanjima telefona.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await saveAvatar(result.assets[0].uri);
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Nema dozvole",
        "Dozvoli pristup galeriji u podešavanjima telefona.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await saveAvatar(result.assets[0].uri);
    }
  };

  const handlePickAvatar = () => {
    Alert.alert("Profilna slika", "Izaberi opciju", [
      { text: "Slikaj", onPress: takePhoto },
      { text: "Izaberi iz galerije", onPress: pickFromLibrary },
      { text: "Otkaži", style: "cancel" },
    ]);
  };

  const handleLogout = async () => {
    setSettingsVisible(false);
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  const handleToggleReminder = async (value: boolean) => {
    const result = await setReadingReminder(value);
    if (result.ok) {
      setReminderEnabled(value);
      return;
    }
    if (result.reason === "expo-go") {
      Alert.alert(
        "Nedostupno u Expo Go",
        "Notifikacije na Androidu rade samo u pravom (EAS) build-u aplikacije, ne u Expo Go razvojnom režimu.",
      );
      return;
    }
    if (result.reason === "permission-denied") {
      Alert.alert(
        "Dozvola nije data",
        "Uključi notifikacije za Libro u podešavanjima telefona (Podešavanja → Aplikacije → Libro → Notifikacije), pa pokušaj ponovo.",
      );
      return;
    }
    Alert.alert(
      "Greška",
      result.message
        ? `Nije uspelo uključivanje podsetnika: ${result.message}`
        : "Nije uspelo uključivanje podsetnika. Pokušaj ponovo.",
    );
  };

  const handleLinkPress = (key: (typeof LINKS)[number]["key"]) => {
    if (key === "collections") {
      router.push("/collections");
      return;
    }
    if (key === "diary") {
      router.push("/tabs/library");
      return;
    }
    comingSoon();
  };

  const openBioEdit = () => {
    setBioDraft(bio ?? "");
    setBioEditVisible(true);
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await updateMyBio(bioDraft);
      setBio(bioDraft.trim() || null);
      setBioEditVisible(false);
    } catch (e: any) {
      Alert.alert("Greška", e.message ?? "Nije uspelo čuvanje opisa.");
    } finally {
      setSavingBio(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "bottom"]}>
        <ActivityIndicator color={COLORS.primaryPink} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={{ width: 32 }} />
          <Pressable
            style={styles.settingsButton}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={COLORS.textMain}
            />
          </Pressable>
        </View>

        <Pressable style={styles.avatarWrap} onPress={handlePickAvatar}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={COLORS.primaryPink} />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={12} color={COLORS.white} />
          </View>
        </Pressable>

        <Text style={styles.name}>{name}</Text>
        {!!username && <Text style={styles.username}>@{username}</Text>}

        <Pressable onPress={openBioEdit} hitSlop={6}>
          <Text style={styles.bio} numberOfLines={2}>
            {bio || "+ Add a short bio"}
          </Text>
        </Pressable>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{booksCount}</Text>
            <Text style={styles.statLabel}>Books</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pagesCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Pages</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0h</Text>
            <Text style={styles.statLabel}>Reading time</Text>
          </View>
        </View>

        <View style={styles.quoteOuter}>
          <View style={styles.quoteCard}>
            <Image
              source={require("@/assets/images/quote-flower.png")}
              style={styles.quoteFlower}
              contentFit="contain"
            />
            <View style={styles.quoteTextWrap}>
              <Text style={styles.quoteText}>
                A reader today,{"\n"}a dreamer always.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.linksList}>
          {LINKS.map((link) => (
            <Pressable
              key={link.key}
              style={styles.linkRow}
              onPress={() => handleLinkPress(link.key)}
            >
              <Ionicons name={link.icon} size={18} color={COLORS.primaryPink} />
              <Text style={styles.linkLabel}>{link.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={17}
                color={COLORS.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <Pressable
          style={styles.settingsBackdrop}
          onPress={() => setSettingsVisible(false)}
        >
          <View style={[styles.menuBox, { top: insets.top + 40, right: 20 }]}>
            <View style={styles.menuItem}>
              <Ionicons
                name="notifications-outline"
                size={17}
                color={COLORS.textMain}
              />
              <Text style={styles.menuItemText}>Daily reminder</Text>
              <View style={{ flex: 1 }} />
              <Switch
                value={reminderEnabled}
                onValueChange={handleToggleReminder}
              />
            </View>
            <Pressable
              style={[styles.menuItem, styles.menuItemDivider]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={17} color="#C0392B" />
              <Text style={[styles.menuItemText, { color: "#C0392B" }]}>
                Log out
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={bioEditVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBioEditVisible(false)}
      >
        <Pressable
          style={styles.editBackdrop}
          onPress={() => setBioEditVisible(false)}
        >
          <Pressable style={styles.editCard} onPress={() => {}}>
            <Text style={styles.editTitle}>Edit bio</Text>

            <TextInput
              style={styles.bioInput}
              placeholder="Tell others what you love to read..."
              placeholderTextColor={COLORS.textSecondary}
              value={bioDraft}
              onChangeText={setBioDraft}
              multiline
              maxLength={80}
            />

            <View style={styles.editButtonRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setBioEditVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, savingBio && { opacity: 0.6 }]}
                onPress={handleSaveBio}
                disabled={savingBio}
              >
                {savingBio ? (
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
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: {
    alignSelf: "center",
    marginTop: 0,
    marginBottom: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightPink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryPink,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  name: {
    fontFamily: FONTS.serifBold,
    fontSize: 28,
    color: COLORS.textMain,
    textAlign: "center",
  },
  username: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 1,
  },
  bio: {
    fontFamily: FONTS.serifMediumItalic,
    fontSize: 13,
    color: COLORS.textAccent,
    textAlign: "center",
    marginTop: 3,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 10,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  statValue: {
    fontFamily: FONTS.serifBold,
    fontSize: 17,
    color: COLORS.textMain,
  },
  statLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  quoteOuter: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 6,
    marginBottom: 10,
  },
  quoteCard: {
    backgroundColor: "#F7E9E7",
    borderRadius: 16,
    minHeight: 78,
    justifyContent: "center",
    overflow: "hidden",
  },
  quoteFlower: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 92,
    height: 78,
  },
  quoteTextWrap: {
    paddingLeft: 84,
    paddingRight: 14,
    paddingVertical: 12,
  },
  quoteText: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 15,
    color: COLORS.textAccent,
    lineHeight: 19,
  },
  linksList: { flexGrow: 1, gap: 7 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  linkLabel: {
    flex: 1,
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textMain,
  },
  settingsBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuBox: {
    position: "absolute",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 4,
    minWidth: 220,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemDivider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
  bioInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 70,
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textAccent,
    textAlignVertical: "top",
    marginBottom: 16,
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
