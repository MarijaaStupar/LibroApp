import { COLORS, FONTS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding3Screen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Image
        source={require("@/assets/images/onboarding/onboarding-3.png")}
        style={styles.imagePlaceholder}
        contentFit="contain"
      />

      <Text style={styles.title}>Track your{"\n"}reading journey</Text>
      <Text style={styles.subtitle}>
        Set goals, save your thoughts and watch your reading life grow.
      </Text>

      <Pressable
        style={styles.startButton}
        onPress={() => router.replace("/auth/login")}
      >
        <Text style={styles.startButtonText}>Let's begin</Text>
        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 80,
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
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primaryPink,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: "auto",
    marginBottom: 16,
  },
  startButtonText: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 18,
    color: COLORS.white,
  },
});
