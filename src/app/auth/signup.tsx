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

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!name || !username || !email || !password) {
      setError("Popuni sva polja.");
      return;
    }
    if (password.length < 6) {
      setError("Lozinka mora imati bar 6 karaktera.");
      return;
    }
    setError("");
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name, username },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      // Confirm email je isključen, korisnik je odmah ulogovan
      router.replace("/tabs");
    } else {
      Alert.alert(
        "Dobrodošla!",
        "Nalog je kreiran. Proveri email da potvrdiš nalog, pa se prijavi.",
      );
      router.replace("/auth/login");
    }
  };

  const comingSoon = () =>
    Alert.alert("Uskoro", "Ova opcija registracije još nije podržana.");

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={26} color={COLORS.textMain} />
      </Pressable>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <LibroLogo size={38} />

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>So many great stories ahead!</Text>

        <View style={styles.form}>
          <AuthTextInput
            icon="person-outline"
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <AuthTextInput
            icon="at-outline"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
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

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={[styles.signupButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? "Creating..." : "Create account"}
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
            <Text style={styles.bottomText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace("/auth/login")}>
              <Text style={styles.bottomLink}>Log in</Text>
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
    fontSize: 23,
    color: COLORS.textMain,
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    fontFamily: FONTS.serifMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 3,
    marginBottom: 14,
  },
  form: { width: "100%" },
  errorText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: "#C0392B",
    marginBottom: 10,
    textAlign: "center",
  },
  signupButton: {
    backgroundColor: COLORS.primaryPink,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  signupButtonText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 16,
    color: COLORS.white,
  },
  dividerText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 10,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginBottom: 14,
  },
  socialButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
