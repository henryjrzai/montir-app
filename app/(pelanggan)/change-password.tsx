/**
 * Halaman Ubah Password Pelanggan
 */

import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";
import { pelangganService } from "../../src/services/pelanggan.service";
import { ChangePasswordRequest } from "../../src/types/pelanggan.types";

type PasswordFields = "password_lama" | "password_baru" | "password_baru_confirmation";

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [passwords, setPasswords] = useState<ChangePasswordRequest>({
    password_lama: "",
    password_baru: "",
    password_baru_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secureText, setSecureText] = useState({
    password_lama: true,
    password_baru: true,
    password_baru_confirmation: true,
  });

  const handleInputChange = (field: keyof ChangePasswordRequest, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    // Clear error for the field being edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const toggleSecureText = (field: keyof typeof secureText) => {
    setSecureText((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    if (passwords.password_baru !== passwords.password_baru_confirmation) {
      setErrors({ password_baru: ["Konfirmasi password baru tidak cocok."] });
      return;
    }
    if (!passwords.password_lama || !passwords.password_baru) {
      Alert.alert("Error", "Semua field harus diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await pelangganService.changePassword(passwords);
      if (response.status) {
        Alert.alert("Sukses", "Password berhasil diubah.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        // Handle validation errors from API
        if (response.errors) {
          setErrors(response.errors);
        } else {
          Alert.alert("Error", response.message || "Gagal mengubah password.");
        }
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Terjadi kesalahan."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ubah Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Old Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password Lama</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={passwords.password_lama}
              onChangeText={(val) => handleInputChange("password_lama", val)}
              placeholder="Masukkan password lama"
              secureTextEntry={secureText.password_lama}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => toggleSecureText("password_lama")}
            >
              <Text>{secureText.password_lama ? "👁️" : "🙈"}</Text>
            </TouchableOpacity>
          </View>
          {errors.password_lama && (
            <Text style={styles.errorText}>{errors.password_lama[0]}</Text>
          )}
        </View>

        {/* New Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password Baru</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={passwords.password_baru}
              onChangeText={(val) => handleInputChange("password_baru", val)}
              placeholder="Masukkan password baru"
              secureTextEntry={secureText.password_baru}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => toggleSecureText("password_baru")}
            >
              <Text>{secureText.password_baru ? "👁️" : "🙈"}</Text>
            </TouchableOpacity>
          </View>
          {errors.password_baru && (
            <Text style={styles.errorText}>{errors.password_baru[0]}</Text>
          )}
        </View>

        {/* Confirm New Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Konfirmasi Password Baru</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={passwords.password_baru_confirmation}
              onChangeText={(val) =>
                handleInputChange("password_baru_confirmation", val)
              }
              placeholder="Konfirmasi password baru"
              secureTextEntry={secureText.password_baru_confirmation}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => toggleSecureText("password_baru_confirmation")}
            >
              <Text>{secureText.password_baru_confirmation ? "👁️" : "🙈"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Simpan Password Baru</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 32,
    color: Colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  saveButton: {
    marginTop: 24,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});
