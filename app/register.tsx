/**
 * Register Screen
 * Halaman untuk user registrasi
 */

import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../src/constants/colors";
import { useAuth } from "../src/contexts/AuthContext";

type UserRole = "pelanggan" | "bengkel" | "montir";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    no_telp: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "pelanggan" as UserRole,
  });

  const [errors, setErrors] = useState({
    nama: "",
    alamat: "",
    no_telp: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const roles = [
    { value: "pelanggan", label: "Pelanggan" },
    { value: "bengkel", label: "Bengkel" },
    // { value: "montir", label: "Montir" },
  ];

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = {
      nama: "",
      alamat: "",
      no_telp: "",
      email: "",
      password: "",
      password_confirmation: "",
    };

    // Validasi nama
    if (!formData.nama) {
      newErrors.nama = "Nama harus diisi";
      valid = false;
    } else if (formData.nama.length < 3) {
      newErrors.nama = "Nama minimal 3 karakter";
      valid = false;
    }

    // Validasi email
    if (!formData.email) {
      newErrors.email = "Email harus diisi";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
      valid = false;
    }

    // Validasi alamat
    if (!formData.alamat) {
      newErrors.alamat = "Alamat harus diisi";
      valid = false;
    }

    // Validasi phone
    if (!formData.no_telp) {
      newErrors.no_telp = "Nomor telepon harus diisi";
      valid = false;
    } else if (!/^[0-9]{10,15}$/.test(formData.no_telp)) {
      newErrors.no_telp = "Nomor telepon tidak valid (10-15 digit)";
      valid = false;
    }

    // Validasi password
    if (!formData.password) {
      newErrors.password = "Password harus diisi";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
      valid = false;
    }

    // Validasi confirm password
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password harus diisi";
      valid = false;
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Password tidak cocok";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(
        formData.nama,
        formData.alamat,
        formData.email,
        formData.password,
        formData.password_confirmation,
        formData.no_telp,
        formData.role
      );

      // Clear form setelah berhasil
      setFormData({
        nama: "",
        alamat: "",
        no_telp: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "pelanggan" as UserRole,
      });

      // Tampilkan success message
      Alert.alert(
        "Registrasi Berhasil",
        "Akun Anda berhasil dibuat. Silakan login untuk melanjutkan.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login" as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Registrasi Gagal",
        error.message || "Terjadi kesalahan saat registrasi"
      );
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daftar Akun</Text>
          <Text style={styles.subtitle}>Buat akun baru Anda</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={[styles.input, errors.nama ? styles.inputError : null]}
              placeholder="Masukkan nama lengkap"
              value={formData.nama}
              onChangeText={(text) => updateFormData("nama", text)}
              autoCapitalize="words"
              editable={!isLoading}
            />
            {errors.nama ? (
              <Text style={styles.errorText}>{errors.nama}</Text>
            ) : null}
          </View>

          {/* Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alamat</Text>
            <TextInput
              style={[
                styles.textarea,
                errors.alamat ? styles.inputError : null,
              ]}
              placeholder="Masukkan alamat lengkap"
              value={formData.alamat}
              onChangeText={(text) => updateFormData("alamat", text)}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
            {errors.alamat ? (
              <Text style={styles.errorText}>{errors.alamat}</Text>
            ) : null}
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="contoh@email.com"
              value={formData.email}
              onChangeText={(text) => updateFormData("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <TextInput
              style={[styles.input, errors.no_telp ? styles.inputError : null]}
              placeholder="08123456789"
              value={formData.no_telp}
              onChangeText={(text) => updateFormData("no_telp", text)}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
            {errors.no_telp ? (
              <Text style={styles.errorText}>{errors.no_telp}</Text>
            ) : null}
          </View>

          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daftar Sebagai</Text>
            <View style={styles.roleContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    formData.role === role.value && styles.roleButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, role: role.value as UserRole })
                  }
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === role.value &&
                        styles.roleButtonTextActive,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChangeText={(text) => updateFormData("password", text)}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.password_confirmation ? styles.inputError : null,
              ]}
              placeholder="Ulangi password"
              value={formData.password_confirmation}
              onChangeText={(text) =>
                updateFormData("password_confirmation", text)
              }
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.password_confirmation ? (
              <Text style={styles.errorText}>
                {errors.password_confirmation}
              </Text>
            ) : null}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Daftar</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.text.primary,
  },
  textarea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.text.primary,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  roleButtonTextActive: {
    color: Colors.white,
  },
  button: {
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});
