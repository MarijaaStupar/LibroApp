import LibroLogo from "@/components/LibroLogo";
import { COLORS, FONTS } from "@/constants/theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding/step1");
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LibroLogo size={56} />
      <Text style={styles.tagline}>Make every{"\n"}chapter yours.</Text>
      <Image
        source={require("@/assets/images/splash-photo.png")}
        style={styles.imagePlaceholder}
        contentFit="cover"
      />
      <Text style={styles.footer}>Good stories{"\n"}make a kinder you</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  tagline: {
    fontFamily: FONTS.serifMediumItalic,
    fontSize: 28,
    color: COLORS.textMain,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 34,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: 300,
    marginTop: 32,
    marginHorizontal: -32,
  },
  footer: {
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 28,
  },
});
