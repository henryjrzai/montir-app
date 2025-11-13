/**
 * Detail Bengkel Page
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";
import { pelangganService } from "../../src/services/pelanggan.service";
import { BengkelDetailData } from "../../src/types/pelanggan.types";

export default function BengkelDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bengkelId = params.bengkelId as string;

  const [bengkelData, setBengkelData] = useState<BengkelDetailData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const loadBengkelDetail = useCallback(async () => {
    try {
      const response = await pelangganService.getBengkelDetail(
        parseInt(bengkelId)
      );

      if (response.status) {
        setBengkelData(response.data);
      } else {
        Alert.alert("Error", response.message || "Gagal memuat detail bengkel");
        router.back();
      }
    } catch (error: any) {
      console.error("Error loading bengkel detail:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat detail bengkel"
      );
      router.back();
    } finally {
      setLoading(false);
    }
  }, [bengkelId, router]);

  const openMaps = async () => {
    if (!bengkelData) return;

    const { latitude, longitude, nama, alamat } = bengkelData.bengkel;
    const label = encodeURIComponent(nama);
    const address = encodeURIComponent(alamat);

    // URL scheme untuk Google Maps
    const scheme = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}(${label})`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    // Fallback ke browser jika app tidak terinstall
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;

    try {
      const supported = await Linking.canOpenURL(scheme!);
      if (supported) {
        await Linking.openURL(scheme!);
      } else {
        // Buka di browser
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening maps:", error);
      Alert.alert(
        "Error",
        "Tidak dapat membuka Google Maps. Pastikan aplikasi terinstall."
      );
    }
  };

  useEffect(() => {
    loadBengkelDetail();
  }, [loadBengkelDetail]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Bengkel</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat detail bengkel...</Text>
        </View>
      </View>
    );
  }

  if (!bengkelData) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Bengkel</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Bengkel Info */}
        <View style={styles.bengkelSection}>
          <Image
            source={{ uri: bengkelData.bengkel.foto }}
            style={styles.bengkelImage}
          />
          <View style={styles.bengkelInfo}>
            <Text style={styles.bengkelName}>{bengkelData.bengkel.nama}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>{bengkelData.bengkel.alamat}</Text>
            </View>
          </View>
        </View>

        {/* Layanan Section */}
        <View style={styles.layananSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔧 Layanan Tersedia</Text>
            <Text style={styles.sectionSubtitle}>
              {bengkelData.layanan.length} layanan
            </Text>
          </View>

          <View style={styles.layananGrid}>
            {bengkelData.layanan.map((layanan) => (
              <View key={layanan.id} style={styles.layananCard}>
                <View style={styles.layananIconContainer}>
                  <Text style={styles.layananIcon}>🔧</Text>
                </View>
                <Text style={styles.layananText}>{layanan.jenis_layanan}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => {
              Alert.alert(
                "Pemesanan",
                "Fitur pemesanan layanan akan segera hadir!"
              );
            }}
          >
            <Text style={styles.orderButtonText}>📱 Pesan Layanan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationButton} onPress={openMaps}>
            <Text style={styles.locationButtonText}>🗺️ Lihat di Maps</Text>
          </TouchableOpacity>
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  bengkelSection: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  bengkelImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
    marginBottom: 16,
  },
  bengkelInfo: {
    gap: 12,
  },
  bengkelName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  coordinateText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    fontFamily: "monospace",
  },
  layananSection: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  layananGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  layananCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    width: "47%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  layananIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  layananIcon: {
    fontSize: 24,
  },
  layananText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
    textAlign: "center",
    lineHeight: 18,
  },
  actionSection: {
    padding: 20,
    gap: 12,
  },
  orderButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  locationButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  locationButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
