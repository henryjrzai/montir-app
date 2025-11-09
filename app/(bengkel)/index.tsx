/**
 * Beranda Bengkel
 */

import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";
import { BengkelService } from "../../src/services/bengkel.service";
import { StorageService } from "../../src/services/storage.service";
import { BengkelData } from "../../src/types/bengkel.types";
import { checkBengkelStatus } from "../../src/utils/bengkelHelper";

export default function BengkelHomeScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const bengkelStatus = checkBengkelStatus(user);

  const [refreshing, setRefreshing] = useState(false);
  const [bengkelData, setBengkelData] = useState<BengkelData | null>(null);

  // Function untuk load status bengkel dari server
  const loadBengkelStatus = useCallback(async () => {
    try {
      const response = await BengkelService.checkValidationStatus();
      if (response.status && response.data) {
        setBengkelData(response.data);

        // Update storage dengan bengkel data terbaru
        await StorageService.updateUserBengkel(response.data);

        // Update user context juga (akan fetch full profile)
        await refreshUser();

        console.log(
          "[BengkelHome] Status updated - verifikasi:",
          response.data.verifikasi
        );
      }
    } catch (error: any) {
      console.error("[BengkelHome] Failed to load status:", error);
      // Jika error, gunakan data dari user context
      if (user?.bengkel) {
        setBengkelData(user.bengkel as any);
      }
    }
  }, [refreshUser, user?.bengkel]);

  // Load bengkel status saat pertama kali mount
  useEffect(() => {
    if (user?.bengkel) {
      loadBengkelStatus();
    }
  }, [user?.bengkel, loadBengkelStatus]);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadBengkelStatus();
    } finally {
      setRefreshing(false);
    }
  }, [loadBengkelStatus]);

  // Function untuk handle lengkapi data
  const handleLengkapiData = () => {
    router.push("/(bengkel)/setup-bengkel" as any);
  };

  // Determine current status based on latest data
  const currentBengkelStatus = bengkelData
    ? {
        hasData: true,
        isVerified: bengkelData.verifikasi === 1,
        type: bengkelData.verifikasi === 1 ? "success" : "warning",
        message:
          bengkelData.verifikasi === 1
            ? "Bengkel Anda sudah terverifikasi dan dapat menerima orderan."
            : bengkelData.alasan_penolakan
            ? `Bengkel Anda ditolak: ${bengkelData.alasan_penolakan}`
            : "Data bengkel Anda sedang dalam proses verifikasi oleh admin.",
      }
    : bengkelStatus;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Selamat Datang! 🔧</Text>
        <Text style={styles.name}>{user?.nama}</Text>
        <Text style={styles.role}>Bengkel</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            title="Memuat status bengkel..."
            titleColor={Colors.text.secondary}
          />
        }
      >
        {/* Alert/Notification Box */}
        {!currentBengkelStatus.isVerified && (
          <View
            style={[
              styles.alertBox,
              currentBengkelStatus.type === "warning" && styles.alertWarning,
              currentBengkelStatus.type === "error" && styles.alertError,
            ]}
          >
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertIcon}>
                {currentBengkelStatus.type === "warning" ? "⚠️" : "❌"}
              </Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {!currentBengkelStatus.hasData
                  ? "Data Bengkel Belum Lengkap"
                  : "Menunggu Verifikasi"}
              </Text>
              <Text style={styles.alertMessage}>
                {currentBengkelStatus.message}
              </Text>

              {!currentBengkelStatus.hasData && (
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={handleLengkapiData}
                >
                  <Text style={styles.alertButtonText}>Lengkapi Data</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Info Bengkel (jika sudah verified) */}
        {currentBengkelStatus.isVerified && bengkelData && (
          <View style={styles.infoCard}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
              <Text style={styles.verifiedText}>Terverifikasi</Text>
            </View>
            <Text style={styles.infoTitle}>{bengkelData.nama}</Text>
            <Text style={styles.infoSubtitle}>{bengkelData.alamat}</Text>
          </View>
        )}

        {/* Placeholder Content */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {refreshing
              ? "Memperbarui status..."
              : "Tarik ke bawah untuk refresh status bengkel"}
          </Text>
        </View>
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
    backgroundColor: Colors.primary,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  // Alert Box Styles
  alertBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertWarning: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alertError: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  alertIconContainer: {
    marginRight: 12,
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  alertButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  // Info Card Styles (Verified)
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  verifiedIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  verifiedText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  // Placeholder
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
