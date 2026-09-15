import { COLORS, FONTS } from "@/constants/theme";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export type NumberField = {
  key: string;
  label: string;
  initialValue?: number;
};

type Props = {
  visible: boolean;
  title: string;
  fields: NumberField[];
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, number>) => void;
};

export default function NumberPromptModal({
  visible,
  title,
  fields,
  submitLabel = "Save",
  onCancel,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        initial[f.key] = f.initialValue != null ? String(f.initialValue) : "";
      });
      setValues(initial);
    }
  }, [visible]);

  const handleSubmit = () => {
    const parsed: Record<string, number> = {};
    for (const f of fields) {
      const n = parseInt(values[f.key], 10);
      parsed[f.key] = isNaN(n) ? 0 : n;
    }
    onSubmit(parsed);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          {fields.map((f, index) => (
            <View key={f.key} style={styles.fieldWrapper}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={values[f.key] ?? ""}
                onChangeText={(t) =>
                  setValues((prev) => ({ ...prev, [f.key]: t }))
                }
                autoFocus={index === 0}
              />
            </View>
          ))}

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveText}>{submitLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(51,38,40,0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontFamily: FONTS.serifBoldItalic,
    fontSize: 20,
    color: COLORS.textMain,
    marginBottom: 16,
    textAlign: "center",
  },
  fieldWrapper: { marginBottom: 14 },
  label: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontFamily: FONTS.sansRegular,
    fontSize: 16,
    color: COLORS.textMain,
    backgroundColor: COLORS.background,
  },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.textMain,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 24,
    alignItems: "center",
    backgroundColor: COLORS.primaryPink,
  },
  saveText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 15,
    color: COLORS.white,
  },
});
