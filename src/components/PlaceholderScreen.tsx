import { COLORS, FONTS } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Ovaj ekran pravimo u sledećem koraku</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 32,
    color: COLORS.textMain,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
