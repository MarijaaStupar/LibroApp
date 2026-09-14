import { COLORS, FONTS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
} from "react-native";

type Props = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
};

export default function AuthTextInput({ icon, isPassword, ...rest }: Props) {
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View style={styles.wrapper}>
      <Ionicons
        name={icon}
        size={19}
        color={COLORS.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry={isPassword ? hidden : false}
        autoCapitalize="none"
        {...rest}
      />
      {isPassword && (
        <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
          <Ionicons
            name={hidden ? "eye-off-outline" : "eye-outline"}
            size={19}
            color={COLORS.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textMain,
  },
});
