/**
 * Profil Pelanggan
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
import { API_CONFIG } from "../../src/config/api";
import { Colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";
import { pelangganService } from "../../src/services/pelanggan.service";
import { ProfileUser } from "../../src/types/pelanggan.types";

export default function PelangganProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const response = await pelangganService.getProfile();
      if (response.status && response.data) {
        setProfile(response.data.user);
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

  const handleActionPress = (action: string) => {
    Alert.alert("Informasi", `Fitur "${action}" sedang dalam pengembangan.`);
  };

  const getImageUrl = () => {
    if (profile?.foto) {
      // Remove /api from base url
      const baseUrl = API_CONFIG.BASE_URL.replace("/api", "");
      return `${baseUrl}/${profile.foto}`;
    }
    // Return a placeholder image if no photo is available
    return "https://via.placeholder.com/100";
  };

  if (loading) {
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
        <Image source={{ uri: getImageUrl() }} style={styles.profileImage} />
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

      {/* Actions Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aksi</Text>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => handleActionPress("Ubah Profil")}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>Ubah Profil</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => handleActionPress("Ubah Foto Profil")}
        >
          <Text style={styles.actionIcon}>🖼️</Text>
          <Text style={styles.actionText}>Ubah Foto Profil</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => handleActionPress("Ubah Password")}
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.white,
    marginBottom: 12,
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
