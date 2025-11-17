/**
 * Profil Bengkel
 * Fetches and displays user profile from the API.
 */

import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { API_CONFIG } from "../../src/config/api";
import { Colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";
import { pelangganService } from "../../src/services/pelanggan.service";
import { ProfileUser } from "../../src/types/pelanggan.types";

export default function BengkelProfileScreen() {
  const router = useRouter();
  const { logout, updateUser } = useAuth();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [bengkel, setBengkel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const response = await pelangganService.getProfile();
      if (response.status && response.data) {
        setProfile(response.data.user);
        setBengkel(response.data.bengkel || null);
      } else {
        Alert.alert("Error", response.message || "Gagal memuat profil");
      }
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat profil"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, [loadProfile]);

  const handleLogout = () => {
    Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login" as any);
        },
      },
    ]);
  };

  const handleUbahProfil = () => {
    if (!profile) return;
    router.push({
      pathname: "/(bengkel)/update-profile",
      params: { ...profile },
    });
  };

  const handleChoosePhoto = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Izin Diperlukan",
        "Anda harus memberikan izin untuk mengakses galeri foto."
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (pickerResult.canceled) {
      return;
    }

    if (pickerResult.assets && pickerResult.assets.length > 0) {
      const imageUri = pickerResult.assets[0].uri;
      setIsUploading(true);
      try {
        const response = await pelangganService.updateProfilePhoto(imageUri);
        if (response.status && response.data) {
          await updateUser(response.data);
          await loadProfile();
          Alert.alert("Sukses", "Foto profil berhasil diperbarui.");
        }
      } catch (error: any) {
        console.error("Failed to upload photo:", error);
        Alert.alert("Error", "Gagal mengunggah foto.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getImageUrl = () => {
    if (profile?.foto) {
      const baseUrl = API_CONFIG.BASE_URL.replace("/api", "");
      return `${baseUrl}/${profile.foto}`;
    }
    return "https://via.placeholder.com/100";
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text>Memuat Profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: getImageUrl() }} style={styles.profileImage} />
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={Colors.white} />
            </View>
          )}
        </View>
        <Text style={styles.name}>{profile?.nama || "Nama Pengguna"}</Text>
        <Text style={styles.email}>{profile?.email || "email@pengguna.com"}</Text>
      </View>

      {/* Info Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informasi Akun</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Telepon</Text>
          <Text style={styles.value}>{profile?.no_telp || "-"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Alamat</Text>
          <Text style={styles.value}>{profile?.alamat || "-"}</Text>
        </View>
      </View>

      {/* Bengkel Info Section */}
      {bengkel && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Bengkel</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nama Bengkel</Text>
            <Text style={styles.value}>{bengkel.nama || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Alamat Bengkel</Text>
            <Text style={styles.value}>{bengkel.alamat || "-"}</Text>
          </View>
        </View>
      )}

      {/* Actions Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aksi</Text>
        <TouchableOpacity style={styles.actionRow} onPress={handleUbahProfil}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>Ubah Profil</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={handleChoosePhoto}>
          <Text style={styles.actionIcon}>🖼️</Text>
          <Text style={styles.actionText}>Ubah Foto Profil</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => router.push("/(bengkel)/change-password")}
        >
          <Text style={styles.actionIcon}>🔒</Text>
          <Text style={styles.actionText}>Ubah Password</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 24,
    paddingTop: 80,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.white,
    marginBottom: 12,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.white,
  },
  email: {
    fontSize: 14,
    color: Colors.gray[200],
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    width: "30%",
  },
  value: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "500",
    width: "70%",
    textAlign: "right",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  actionArrow: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  logoutButton: {
    margin: 20,
    marginBottom: 40,
    height: 50,
    backgroundColor: Colors.error + "20",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.error,
  },
});
