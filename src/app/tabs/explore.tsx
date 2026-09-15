import { COLORS, FONTS } from "@/constants/theme";
import { getRandomBook, MOODS } from "@/services/explore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loadingSurprise, setLoadingSurprise] = useState(false);

  const goToResults = (
    mode: string,
    extra: Record<string, string>,
    title: string,
  ) => {
    router.push({
      pathname: "/explore/results",
      params: { mode, title, ...extra },
    });
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    goToResults("search", { q: query.trim() }, query.trim());
  };

  const handleSurprise = async () => {
    setLoadingSurprise(true);
    try {
      const book = await getRandomBook();
      if (!book) {
        Alert.alert("Hmm", "Nema još knjiga u katalogu.");
        return;
      }
      router.push(`/book/${book.id}`);
    } catch {
      Alert.alert("Greška", "Nije uspelo učitavanje. Pokušaj ponovo.");
    } finally {
      setLoadingSurprise(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Explore!</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors or moods..."
            placeholderTextColor={COLORS.textSecondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>

        <Text style={styles.sectionHeader}>What&apos;s your reading mood?</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((mood, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const isAlt = (row + col) % 2 === 1;
            const IconComp =
              mood.iconSet === "mci" ? MaterialCommunityIcons : Ionicons;
            const iconColor = isAlt ? COLORS.textMain : COLORS.primaryPink;

            return (
              <Pressable
                key={mood.key}
                style={[
                  styles.moodChip,
                  {
                    backgroundColor: isAlt
                      ? COLORS.backgroundSecondary
                      : COLORS.card,
                  },
                ]}
                onPress={() =>
                  goToResults(
                    "mood",
                    { mood: mood.key },
                    mood.label.replace("\n", " "),
                  )
                }
              >
                <IconComp name={mood.icon as any} size={26} color={iconColor} />
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Short on time?</Text>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              goToResults("pages", { max: "250" }, "Under 250 pages")
            }
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="time" size={16} color={COLORS.white} />
            </View>
            <Text style={styles.actionButtonText}>Under 250 pages</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={COLORS.textAccent}
            />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Try something different</Text>
          <Pressable
            style={styles.actionButton}
            onPress={handleSurprise}
            disabled={loadingSurprise}
          >
            <Ionicons name="sparkles" size={18} color={COLORS.primaryPink} />
            <Text style={styles.actionButtonText}>
              {loadingSurprise ? "Loading..." : "Suprise me!"}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={COLORS.textAccent}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 6 },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 30,
    color: COLORS.textMain,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textMain,
  },
  sectionHeader: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 18,
    color: COLORS.textMain,
    marginBottom: 10,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  moodChip: {
    width: "31.5%",
    height: 92,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    gap: 6,
    marginBottom: 10,
  },
  moodLabel: {
    fontFamily: FONTS.serifMedium,
    fontSize: 13,
    lineHeight: 16,
    color: COLORS.textMain,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    fontFamily: FONTS.serifBold,
    fontSize: 19,
    color: COLORS.textMain,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightPink,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  actionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryPink,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    flex: 1,
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textAccent,
  },
});
