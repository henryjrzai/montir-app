/**
 * Setup Bengkel Screen
 * Halaman untuk melengkapi data bengkel
 */

import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";
import { BengkelService } from "../../src/services/bengkel.service";

export default function SetupBengkelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    console.log("Received params:", params);
    if (params.latitude && params.longitude) {
      setFormData((prevData) => ({
        ...prevData,
        latitude: params.latitude as string,
        longitude: params.longitude as string,
      }));
    }
  }, [params.latitude, params.longitude]);

  const [foto, setFoto] = useState<any>(null);

  const [errors, setErrors] = useState({
    nama: "",
    alamat: "",
    latitude: "",
    longitude: "",
    foto: "",
  });

  // Request permission untuk akses galeri
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Aplikasi memerlukan izin akses galeri untuk upload foto bengkel."
      );
      return false;
    }
    return true;
  };

  // Pick image dari galeri
  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFoto(result.assets[0]);
      setErrors({ ...errors, foto: "" });
    }
  };

  // Request permission for location access
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Lokasi Diperlukan",
        "Aplikasi memerlukan izin akses lokasi untuk mengisi koordinat secara otomatis."
      );
      return false;
    }
    return true;
  };

  // Get current location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setFormData((prevData) => ({
        ...prevData,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      }));
      setErrors((prevErrors) => ({ ...prevErrors, latitude: "", longitude: "" }));
      Alert.alert("Berhasil", "Lokasi berhasil didapatkan!");
    } catch (error) {
      console.error("[SetupBengkel] Gagal mendapatkan lokasi:", error);
      Alert.alert(
        "Gagal",
        "Tidak dapat mendapatkan lokasi saat ini. Pastikan GPS Anda aktif."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Validasi form
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = {
      nama: "",
      alamat: "",
      latitude: "",
      longitude: "",
      foto: "",
    };

    if (!formData.nama) {
      newErrors.nama = "Nama bengkel harus diisi";
      valid = false;
    } else if (formData.nama.length < 3) {
      newErrors.nama = "Nama bengkel minimal 3 karakter";
      valid = false;
    }

    if (!formData.alamat) {
      newErrors.alamat = "Alamat harus diisi";
      valid = false;
    }

    if (!formData.latitude) {
      newErrors.latitude = "Latitude harus diisi";
      valid = false;
    } else if (isNaN(parseFloat(formData.latitude))) {
      newErrors.latitude = "Latitude harus berupa angka";
      valid = false;
    }

    if (!formData.longitude) {
      newErrors.longitude = "Longitude harus diisi";
      valid = false;
    } else if (isNaN(parseFloat(formData.longitude))) {
      newErrors.longitude = "Longitude harus berupa angka";
      valid = false;
    }

    if (!foto) {
      newErrors.foto = "Foto bengkel harus diupload";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      console.log("[SetupBengkel] Submitting form data:", {
        nama: formData.nama,
        alamat: formData.alamat,
        latitude: formData.latitude,
        longitude: formData.longitude,
        foto: {
          uri: foto?.uri,
          fileName: foto?.fileName,
          type: foto?.type,
        },
      });

      const response = await BengkelService.setupBengkel(
        formData.nama,
        formData.alamat,
        formData.latitude,
        formData.longitude,
        foto
      );

      console.log("[SetupBengkel] Response received:", response);

      if (response.status) {
        // Refresh user data untuk update bengkel info
        await refreshUser();

        Alert.alert(
          "Berhasil!",
          "Data bengkel berhasil disimpan. Menunggu verifikasi dari admin.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        throw new Error(response.message || "Gagal menyimpan data bengkel");
      }
    } catch (error: any) {
      console.error("[SetupBengkel] Submit error:", error);

      Alert.alert(
        "Gagal",
        error.message || "Terjadi kesalahan saat menyimpan data bengkel"
      );
    } finally {
      setIsLoading(false);
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lengkapi Data Bengkel</Text>
          <Text style={styles.subtitle}>
            Isi data bengkel Anda untuk dapat menggunakan aplikasi
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Nama Bengkel */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nama Bengkel <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.nama ? styles.inputError : null]}
              placeholder="Contoh: Bengkel Jaya Motor"
              value={formData.nama}
              onChangeText={(text) => updateFormData("nama", text)}
              editable={!isLoading}
            />
            {errors.nama ? (
              <Text style={styles.errorText}>{errors.nama}</Text>
            ) : null}
          </View>

          {/* Alamat */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Alamat Lengkap <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textarea,
                errors.alamat ? styles.inputError : null,
              ]}
              placeholder="Masukkan alamat lengkap bengkel"
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

          {/* Latitude & Longitude */}
          <View style={styles.inputGroup}>
            <View style={styles.latLongHeader}>
              <Text style={styles.label}>
                Koordinat Bengkel <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() =>
                  router.push({
                    pathname: "/(bengkel)/pilih-lokasi",
                    params: {
                      latitude: formData.latitude,
                      longitude: formData.longitude,
                    },
                  })
                }
                disabled={isLoading}
              >
                <Text style={styles.mapButtonText}>Pilih dari Peta</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWithButton}>
              <TextInput
                style={[
                  styles.input,
                  styles.latLongInput,
                  errors.latitude ? styles.inputError : null,
                ]}
                placeholder="Latitude"
                value={formData.latitude}
                onChangeText={(text) => updateFormData("latitude", text)}
                keyboardType="numeric"
                editable={!isLoading}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.latLongInput,
                  errors.longitude ? styles.inputError : null,
                ]}
                placeholder="Longitude"
                value={formData.longitude}
                onChangeText={(text) => updateFormData("longitude", text)}
                keyboardType="numeric"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={isLoading}
              >
                <Text style={styles.locationButtonText}>Lokasi Saat Ini</Text>
              </TouchableOpacity>
            </View>
            {errors.latitude || errors.longitude ? (
              <Text style={styles.errorText}>
                {errors.latitude || errors.longitude}
              </Text>
            ) : null}
            <Text style={styles.helpText}>
              Pilih dari peta, atau isi manual, atau dapatkan lokasi otomatis.
            </Text>
          </View>
        </View>

        {/* Foto Bengkel */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Foto Bengkel <Text style={styles.required}>*</Text>
          </Text>

            {foto ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: foto.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={pickImage}
                  disabled={isLoading}
                >
                  <Text style={styles.changeImageButtonText}>Ganti Foto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  errors.foto ? styles.uploadButtonError : null,
                ]}
                onPress={pickImage}
                disabled={isLoading}
              >
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadText}>Pilih Foto Bengkel</Text>
                <Text style={styles.uploadSubtext}>
                  Format: JPG, PNG (Max 5MB)
                </Text>
              </TouchableOpacity>
            )}

            {errors.foto ? (
              <Text style={styles.errorText}>{errors.foto}</Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Simpan Data Bengkel</Text>
            )}
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
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
  inputWithButton: {
    flexDirection: "column",
    gap: 10,
  },
  latLongHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mapButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  mapButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  latLongInput: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
  },
  locationButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
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
  helpText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
    fontStyle: "italic",
  },
  // Image Upload Styles
  uploadButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonError: {
    borderColor: Colors.error,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  imageContainer: {
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 12,
  },
  changeImageButton: {
    backgroundColor: Colors.gray[200],
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  changeImageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  // Submit Button
  submitButton: {
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
});
