import { ONBOARDING_SEEN_KEY } from "@/constants/storageKeys";
import { COLORS, FONTS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding1Screen() {
  const router = useRouter();

  const skip = () => {
    AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "1");
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Pressable onPress={skip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <Image
        source={require("@/assets/images/onboarding/onboarding-1.png")}
        style={styles.imagePlaceholder}
        contentFit="contain"
      />

      <Text style={styles.title}>A calmer,{"\n"}happier you</Text>
      <Text style={styles.subtitle}>
        Reading isn't just a hobby, it's a way to feel more like yourself.
      </Text>

      <View style={styles.bottomRow}>
        <View style={styles.buttonSpacer} />
        <View style={styles.dotsWrapper}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Pressable
          style={styles.nextButton}
          onPress={() => router.push("/onboarding/step2")}
        >
          <Ionicons name="arrow-forward" size={22} color={COLORS.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  skipButton: { alignSelf: "flex-end", marginTop: 8, marginBottom: 16 },
  skipText: {
    fontFamily: FONTS.serifMedium,
    fontSize: 16,
    color: COLORS.textMain,
  },
  imagePlaceholder: {
    width: "85%",
    alignSelf: "center",
    height: 340,
    backgroundColor: "transparent",
  },
  title: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 30,
    color: COLORS.textMain,
    textAlign: "center",
    marginTop: 28,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: FONTS.serifMedium,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    marginBottom: 16,
  },
  buttonSpacer: { width: 52 },
  dotsWrapper: { flexDirection: "row", gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.softPink,
  },
  dotActive: { backgroundColor: COLORS.primaryPink, width: 20 },
  nextButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryPink,
    alignItems: "center",
    justifyContent: "center",
  },
});
