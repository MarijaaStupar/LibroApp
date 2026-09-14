import AuthTextInput from "@/components/AuthTextInput";
import LibroLogo from "@/components/LibroLogo";
import { COLORS, FONTS } from "@/constants/theme";
import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Unesi email i lozinku.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace("/tabs");
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Unesi email",
        "Prvo unesi svoj email da bismo poslali link za reset lozinke.",
      );
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
    );
    if (resetError) {
      Alert.alert("Greška", resetError.message);
    } else {
      Alert.alert("Poslato", "Proveri email za link za reset lozinke.");
    }
  };

  const comingSoon = () =>
    Alert.alert("Uskoro", "Ova opcija prijave još nije podržana.");

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={26} color={COLORS.textMain} />
      </Pressable>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LibroLogo size={42} />

        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>Your next chapter is waiting.</Text>

        <View style={styles.form}>
          <AuthTextInput
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <AuthTextInput
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
          />

          <Pressable onPress={handleForgotPassword} style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Logging in..." : "Log in"}
            </Text>
          </Pressable>

          <Text style={styles.dividerText}>or continue with</Text>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton} onPress={comingSoon}>
              <Ionicons name="logo-google" size={19} color={COLORS.textMain} />
            </Pressable>
            <Pressable style={styles.socialButton} onPress={comingSoon}>
              <Ionicons name="logo-apple" size={19} color={COLORS.textMain} />
            </Pressable>
            <Pressable style={styles.socialButton} onPress={comingSoon}>
              <Ionicons name="mail-outline" size={19} color={COLORS.textMain} />
            </Pressable>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Don't have an account? </Text>
            <Pressable onPress={() => router.replace("/auth/signup")}>
              <Text style={styles.bottomLink}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  backButton: {
    marginLeft: 16,
    marginTop: 4,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 26,
    color: COLORS.textMain,
    textAlign: "center",
    marginTop: 12,
  },
  subtitle: {
    fontFamily: FONTS.serifMedium,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 18,
  },
  form: { width: "100%" },
  forgotButton: { alignSelf: "flex-end", marginBottom: 14 },
  forgotText: {
    fontFamily: FONTS.serifMedium,
    fontSize: 14,
    color: COLORS.primaryPink,
  },
  errorText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: "#C0392B",
    marginBottom: 10,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: COLORS.primaryPink,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  loginButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 16,
    color: COLORS.white,
  },
  dividerText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bottomRow: { flexDirection: "row", justifyContent: "center" },
  bottomText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textMain,
  },
  bottomLink: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 14,
    color: COLORS.primaryPink,
  },
});
