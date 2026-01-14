/**
 * Detail Bengkel Page
 */

import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import StarRating from "../../src/components/StarRating";
import { Colors } from "../../src/constants/colors";
import { pelangganService } from "../../src/services/pelanggan.service";
import {
  BengkelDetailData,
  LayananBengkelItem,
} from "../../src/types/pelanggan.types";

export default function BengkelDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bengkelId = params.bengkelId as string;

  const [bengkelData, setBengkelData] = useState<BengkelDetailData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedLayanan, setSelectedLayanan] =
    useState<LayananBengkelItem | null>(null);
  const [ordering, setOrdering] = useState(false);

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

    const { latitude, longitude, nama } = bengkelData.bengkel;
    const label = encodeURIComponent(nama);

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

  const handleOrderLayanan = (layanan: LayananBengkelItem) => {
    setSelectedLayanan(layanan);
    setShowOrderModal(true);
  };

  const confirmOrder = async () => {
    if (!selectedLayanan) return;

    try {
      setOrdering(true);

      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Lokasi Diperlukan",
          "Aplikasi memerlukan akses lokasi untuk membuat pesanan."
        );
        setOrdering(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const response = await pelangganService.createOrder({
        layanan_bengkel_id: selectedLayanan.id,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (response.status === "success") {
        setShowOrderModal(false);
        Alert.alert(
          "Berhasil! 🎉",
          `Pesanan ${selectedLayanan.jenis_layanan} berhasil dibuat!\n\nMontir akan segera menuju lokasi Anda.`,
          [
            {
              text: "Lihat Riwayat",
              onPress: () => router.push("/(pelanggan)/" as any),
            },
            { text: "OK" },
          ]
        );
      } else {
        Alert.alert("Error", response.message || "Gagal membuat pesanan");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal membuat pesanan"
      );
    } finally {
      setOrdering(false);
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

            {/* Overall Rating */}
            {bengkelData.bengkel.rating !== undefined &&
              bengkelData.bengkel.rating !== null && (
                <View style={styles.ratingContainer}>
                  <StarRating
                    rating={Number(bengkelData.bengkel.rating)}
                    onSelectRating={() => {}} // Not selectable here
                    starSize={20}
                  />
                  <Text style={styles.overallRatingText}>
                    ({bengkelData.bengkel.rating}/5)
                  </Text>
                </View>
              )}
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
              <TouchableOpacity
                key={layanan.id}
                style={styles.layananCard}
                onPress={() => handleOrderLayanan(layanan)}
                activeOpacity={0.7}
              >
                <View style={styles.layananIconContainer}>
                  <Text style={styles.layananIcon}>🔧</Text>
                </View>
                <Text style={styles.layananText}>{layanan.jenis_layanan}</Text>
                <Text style={styles.layananText}>{`Rp. ${layanan.harga.toLocaleString("id-ID")}`}</Text>
                <Text style={styles.orderHint}>Tap untuk pesan</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.locationButton} onPress={openMaps}>
            <Text style={styles.locationButtonText}>🗺️ Lihat di Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews Section */}
        {bengkelData.ulasan && bengkelData.ulasan.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Ulasan Pelanggan</Text>
              <Text style={styles.sectionSubtitle}>
                {bengkelData.ulasan.length} ulasan
              </Text>
            </View>
            {bengkelData.ulasan.map((ulasanItem) => (
              <View key={ulasanItem.id} style={styles.reviewCard}>
                <View style={styles.reviewerInfo}>
                  <Image
                      source={{ uri: ulasanItem.pelanggan.foto }}
                      style={styles.reviewerAvatar}
                  />
                  <View>
                    <Text style={styles.reviewerName}>
                      {ulasanItem.pelanggan.nama}
                    </Text>
                    <StarRating
                        rating={Number(ulasanItem.rating)}
                        onSelectRating={() => {}}
                        starSize={15}
                    />
                  </View>
                </View>
                {ulasanItem.komentar && (
                  <Text style={styles.reviewComment}>
                    {ulasanItem.komentar}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Order Modal */}
      <Modal
        visible={showOrderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konfirmasi Pesanan</Text>

            {selectedLayanan && (
              <>
                <View style={styles.modalLayananInfo}>
                  <View style={styles.modalLayananIcon}>
                    <Text style={styles.modalIconText}>🔧</Text>
                  </View>
                  <View style={styles.modalLayananText}>
                    <Text style={styles.modalLayananName}>
                      {selectedLayanan.jenis_layanan}
                    </Text>
                    <Text style={styles.modalBengkelName}>
                      {bengkelData?.bengkel.nama}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    📍 Lokasi Anda saat ini akan digunakan untuk pemesanan
                  </Text>
                  <Text style={styles.modalInfoText}>
                    🚗 Montir akan segera menuju lokasi Anda
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShowOrderModal(false)}
                    disabled={ordering}
                  >
                    <Text style={styles.modalCancelText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalConfirmButton,
                      ordering && styles.modalConfirmButtonDisabled,
                    ]}
                    onPress={confirmOrder}
                    disabled={ordering}
                  >
                    {ordering ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.modalConfirmText}>
                        Konfirmasi Pesanan
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  orderHint: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 8,
    fontWeight: "500",
  },
  actionSection: {
    padding: 20,
    gap: 12,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  modalLayananInfo: {
    flexDirection: "row",
    backgroundColor: Colors.primary + "10",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  modalLayananIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + "30",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalIconText: {
    fontSize: 28,
  },
  modalLayananText: {
    flex: 1,
  },
  modalLayananName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  modalBengkelName: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  modalInfo: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.gray[200],
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  modalConfirmButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  modalConfirmButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  overallRatingText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  reviewsSection: {
    padding: 20,
    backgroundColor: Colors.background,
    marginTop: 10,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Colors.gray[200],
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
