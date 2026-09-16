import LibroLogo from "@/components/LibroLogo";
import { ONBOARDING_SEEN_KEY } from "@/constants/storageKeys";
import { COLORS, FONTS } from "@/constants/theme";
import { supabase } from "@/services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootGate() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active || hasNavigated.current) return;

      if (session) {
        hasNavigated.current = true;
        router.replace("/tabs");
        return;
      }

      const onboardingSeen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
      if (!active || hasNavigated.current) return;

      hasNavigated.current = true;
      router.replace(onboardingSeen ? "/auth/login" : "/onboarding/step1");
    })();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.top}>
        <LibroLogo size={48} />
        <Text style={styles.tagline}>Make every{"\n"}chapter yours.</Text>
      </View>

      <Image
        source={require("@/assets/images/splash-photo.png")}
        style={styles.photo}
        contentFit="contain"
      />

      <View style={styles.bottom}>
        <Text style={styles.quote}>Good stories{"\n"}make a kinder you</Text>
        <ActivityIndicator
          color={COLORS.primaryPink}
          style={styles.spinner}
        />
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
  top: { alignItems: "center", marginTop: 32 },
  tagline: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 26,
    color: COLORS.textMain,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 32,
  },
  photo: { flex: 1, width: "100%", marginTop: 16 },
  bottom: { alignItems: "center", marginBottom: 24 },
  quote: {
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textMain,
    textAlign: "center",
    lineHeight: 21,
  },
  spinner: { marginTop: 14 },
});
