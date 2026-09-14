import { COLORS, FONTS } from "@/constants/theme";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

export default function LibroLogo({ size = 48 }: { size?: number }) {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
      <Text style={[styles.logoText, { fontSize: size * 1.1 }]}>Libro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  logoText: {
    fontFamily: FONTS.serifBold,
    color: COLORS.textMain,
    marginTop: 4,
  },
});
