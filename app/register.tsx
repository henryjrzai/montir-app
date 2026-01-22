/**
 * Register Screen
 * Halaman untuk user registrasi
 */

import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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

  // State for Terms & Conditions
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

    // Check if user selected bengkel role and hasn't agreed to terms
    if (formData.role === "bengkel" && !agreedToTerms) {
      setShowTermsModal(true);
      return;
    }

    try {
      await register(
        formData.nama,
        formData.alamat,
        formData.email,
        formData.password,
        formData.password_confirmation,
        formData.no_telp,
        formData.role,
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
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Registrasi Gagal",
        error.message || "Terjadi kesalahan saat registrasi",
      );
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleAcceptTerms = () => {
    setAgreedToTerms(true);
    setShowTermsModal(false);
    // After accepting terms, proceed with registration
    handleRegister();
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
          <Image
            source={require("../assets/images/montir-app-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
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

      {/* Terms & Conditions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Syarat & Ketentuan Bengkel</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.termsTitle}>
                Selamat datang di Aplikasi Montir!
              </Text>
              <Text style={styles.termsText}>
                Dengan mendaftar sebagai Bengkel, Anda menyetujui syarat dan
                ketentuan berikut:
              </Text>

              <Text style={styles.termsSectionTitle}>
                1. Biaya Admin Platform
              </Text>
              <Text style={styles.termsText}>
                • Setiap transaksi dikenakan biaya admin sebesar{" "}
                <Text style={styles.termsHighlight}>5% (lima persen)</Text> dari
                total harga layanan.
              </Text>
              <Text style={styles.termsText}>
                • Biaya admin ini{" "}
                <Text style={styles.termsHighlight}>
                  dibayarkan oleh pelanggan
                </Text>
                , bukan dipotong dari bengkel.
              </Text>
              <Text style={styles.termsText}>
                • Perhitungan:{" "}
                <Text style={styles.termsHighlight}>
                  Biaya Admin = 5% × (Harga Layanan + Item Service Tambahan)
                </Text>
              </Text>
              <Text style={styles.termsText}>
                • Contoh: Harga layanan Rp 100.000 + Item service Rp 50.000 = Rp
                150.000. Biaya admin = Rp 7.500 (5% × Rp 150.000). Total yang
                dibayar pelanggan = Rp 157.500.
              </Text>

              <Text style={styles.termsSectionTitle}>
                2. Pembayaran dan Pencairan Dana
              </Text>
              <Text style={styles.termsText}>
                • Bengkel akan menerima pembayaran sesuai harga layanan dan item
                service yang telah ditetapkan (tanpa potongan).
              </Text>
              <Text style={styles.termsText}>
                • Biaya admin 5% dibayarkan langsung oleh pelanggan kepada
                platform.
              </Text>
              <Text style={styles.termsText}>
                • Pencairan dana dilakukan setelah pelanggan menyelesaikan
                pembayaran dan konfirmasi order selesai.
              </Text>

              <Text style={styles.termsSectionTitle}>3. Kualitas Layanan</Text>
              <Text style={styles.termsText}>
                • Bengkel wajib memberikan layanan terbaik kepada pelanggan.
              </Text>
              <Text style={styles.termsText}>
                • Bengkel bertanggung jawab atas kualitas pekerjaan dan suku
                cadang yang digunakan.
              </Text>
              <Text style={styles.termsText}>
                • Harga layanan dan item service harus transparan dan sesuai
                dengan kondisi aktual.
              </Text>

              <Text style={styles.termsSectionTitle}>4. Kewajiban Bengkel</Text>
              <Text style={styles.termsText}>
                • Merespons pesanan dengan cepat dan tepat waktu.
              </Text>
              <Text style={styles.termsText}>
                • Memberikan informasi yang akurat mengenai layanan dan harga.
              </Text>
              <Text style={styles.termsText}>
                • Menjaga profesionalitas dalam setiap interaksi dengan
                pelanggan.
              </Text>

              <Text style={styles.termsSectionTitle}>5. Sanksi</Text>
              <Text style={styles.termsText}>
                • Pelanggaran terhadap syarat dan ketentuan dapat mengakibatkan
                penangguhan atau penutupan akun bengkel.
              </Text>
              <Text style={styles.termsText}>
                • Komplain berulang dari pelanggan akan ditinjau dan dapat
                berdampak pada status akun.
              </Text>

              <Text style={styles.termsFooter}>
                Dengan menyetujui syarat dan ketentuan ini, Anda telah membaca,
                memahami, dan menyetujui semua ketentuan yang berlaku.
              </Text>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleAcceptTerms}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  Setuju & Lanjutkan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: Colors.primary,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  termsSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  termsHighlight: {
    fontWeight: "bold",
    color: Colors.primary,
  },
  termsFooter: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontStyle: "italic",
    // marginTop: 15,
    marginBottom: 25,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButtonSecondary: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.gray[200],
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  modalButtonPrimary: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
});
