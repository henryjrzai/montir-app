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
import { OrderService } from "../../src/services/order.service";
import { StorageService } from "../../src/services/storage.service";
import { BengkelData } from "../../src/types/bengkel.types";
import { Order } from "../../src/types/order.types";
import MontirRatingChart from "../../src/components/MontirRatingChart";
import RatingDetailModal from "../../src/components/RatingDetailModal";
import { checkBengkelStatus } from "../../src/utils/bengkelHelper";

export default function BengkelHomeScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const bengkelStatus = checkBengkelStatus(user);

  const [refreshing, setRefreshing] = useState(false);
  const [bengkelData, setBengkelData] = useState<BengkelData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [montirRatings, setMontirRatings] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMontir, setSelectedMontir] = useState<any>(null);

  const handleDataPointClick = ({ index }: { index: number }) => {
    setSelectedMontir(montirRatings[index]);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMontir(null);
  };

  // Function untuk load order list
  const loadOrders = useCallback(async () => {
    // Hanya load orders jika bengkel sudah verified
    if (!bengkelData || bengkelData.verifikasi !== 1) {
      return;
    }

    try {
      setLoadingOrders(true);
      const response = await OrderService.getOrderList();
      if (response.status === "success" && response.data) {
        setOrders(response.data);
      }
      const ratingResponse = await BengkelService.getMontirRatings();
      if (ratingResponse.status && ratingResponse.data) {
        setMontirRatings(ratingResponse.data);
      }
    } catch (error: any) {
      console.error("[BengkelHome] Failed to load orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  }, [bengkelData]);

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
      // console.error("[BengkelHome] Failed to load status:", error);
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

  // Load orders ketika bengkel data berubah dan verified
  useEffect(() => {
    if (bengkelData && bengkelData.verifikasi === 1) {
      loadOrders();
    }
  }, [bengkelData, loadOrders]);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadBengkelStatus();
      // Load orders juga saat refresh jika sudah verified
      if (bengkelData && bengkelData.verifikasi === 1) {
        await loadOrders();
      }
      console.log(`bengkelData`, bengkelData);
    } finally {
      setRefreshing(false);
    }
  }, [loadBengkelStatus, loadOrders, bengkelData]);

  // Function untuk handle lengkapi data
  const handleLengkapiData = () => {
    router.push("/(bengkel)/setup-bengkel" as any);
  };

  // Determine current status based on latest data
  const currentBengkelStatus = bengkelData
    ? {
        hasData: true,
        isVerified: bengkelData.verifikasi === 1 ? true : false,
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
        <Text style={styles.role}>{bengkelData?.nama || "Bengkel"}</Text>
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

        {/* Menu Navigasi  */}
        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push("/(bengkel)/layanan" as any)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>🔧</Text>
            </View>
            <Text style={styles.menuTitle}>Layanan</Text>
            <Text style={styles.menuSubtitle}>Kelola layanan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push("/(bengkel)/montir" as any)}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>👨‍🔧</Text>
            </View>
            <Text style={styles.menuTitle}>Montir</Text>
            <Text style={styles.menuSubtitle}>Kelola montir</Text>
          </TouchableOpacity>
        </View>

        {currentBengkelStatus.isVerified && montirRatings.length > 0 && (
          <View>
            <MontirRatingChart
              data={montirRatings}
              onDataPointClick={handleDataPointClick}
            />
          </View>
        )}

        {/* Order List - Hanya tampil jika verified */}
        {currentBengkelStatus.isVerified && (
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Orderan Masuk</Text>

            {loadingOrders ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Memuat orderan...</Text>
              </View>
            ) : orders.length > 0 ? (
              orders.slice(0, 10).map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                      <Text style={styles.orderIdText}>{order.kode_order}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        order.status === "menunggu" && styles.statusMenunggu,
                        order.status === "kelokasi" && styles.statusKelokasi,
                        order.status === "kerjakan" && styles.statusKerjakan,
                        order.status === "pembayaran" && styles.statusPembayaran,
                        order.status === "selesai" && styles.statusSelesai,
                        order.status === "batal" && styles.statusBatal,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {order.status === "menunggu"
                          ? "⏳ Menunggu"
                          : order.status === "kelokasi"
                          ? "🚗 Ke Lokasi"
                          : order.status === "kerjakan"
                          ? "🔧 Dikerjakan"
                          : order.status === "pembayaran"
                          ? "💰 Pembayaran"
                          : order.status === "selesai"
                          ? "✅ Selesai"
                          : "❌ Batal"}
                      </Text>
                    </View>
                  </View>

                  {/* Layanan Info */}
                  <View style={styles.orderContent}>
                    <Text style={styles.layananText}>
                      🔧 {order.layanan_bengkel.jenis_layanan}
                    </Text>

                    {/* Pelanggan Info */}
                    <View style={styles.pelangganInfo}>
                      <Text style={styles.pelangganLabel}>Pelanggan:</Text>
                      <Text style={styles.pelangganNama}>
                        {order.pelanggan.nama}
                      </Text>
                      <Text style={styles.pelangganTelp}>
                        📱 {order.pelanggan.no_telp}
                      </Text>
                    </View>

                    {/* Lokasi */}
                    <View style={styles.lokasiInfo}>
                      <Text style={styles.lokasiIcon}>📍</Text>
                      <Text style={styles.lokasiText}>
                        Lat: {parseFloat(order.latitude).toFixed(4)}, Long:{" "}
                        {parseFloat(order.longitude).toFixed(4)}
                      </Text>
                    </View>

                    {/* Harga */}
                    {order.harga_layanan && (
                      <View style={styles.hargaContainer}>
                        <Text style={styles.hargaLabel}>Harga:</Text>
                        <Text style={styles.hargaText}>
                          Rp {order.harga_layanan.toLocaleString("id-ID")}
                        </Text>
                      </View>
                    )}

                    {/* Payment Status */}
                    <View style={styles.paymentStatus}>
                      <Text
                        style={[
                          styles.paymentText,
                          order.status_pembayaran === "paid" &&
                            styles.paymentLunas,
                        ]}
                      >
                        {order.status_pembayaran === "paid"
                          ? "✓ Lunas"
                          : "⏳ Belum Lunas"}
                      </Text>
                    </View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      router.push({
                        pathname: "/(bengkel)/order-detail",
                        params: { orderId: order.id },
                      } as any);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Lihat Detail</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyOrderContainer}>
                <Text style={styles.emptyOrderIcon}>📦</Text>
                <Text style={styles.emptyOrderText}>
                  Belum ada orderan masuk
                </Text>
                <Text style={styles.emptyOrderSubtext}>
                  Orderan baru akan muncul di sini
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Placeholder - Hanya tampil jika belum verified */}
        {!currentBengkelStatus.isVerified && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {refreshing
                ? "Memperbarui status..."
                : "Tarik ke bawah untuk refresh status bengkel"}
            </Text>
          </View>
        )}
      </ScrollView>
      <RatingDetailModal
        visible={modalVisible}
        onClose={closeModal}
        data={selectedMontir}
      />
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
  // Menu Grid Styles
  menuGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    marginBottom: 10,
    gap: 12,
  },
  menuCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuIcon: {
    fontSize: 32,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
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
  // Order Section Styles
  orderSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  // Order Card Styles
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderIdLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginRight: 4,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusMenunggu: {
    backgroundColor: Colors.warning + "20",
  },
  statusKelokasi: {
    backgroundColor: Colors.info + "20",
  },
  statusKerjakan: {
    backgroundColor: Colors.primary + "20",
  },
  statusSelesai: {
    backgroundColor: Colors.success + "20",
  },
  statusPembayaran: {
    backgroundColor: Colors.warning + "20",
  },
  statusBatal: {
    backgroundColor: Colors.error + "20",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  orderContent: {
    marginBottom: 12,
  },
  layananText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  pelangganInfo: {
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pelangganLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  pelangganNama: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  pelangganTelp: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  lokasiInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  lokasiIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  lokasiText: {
    fontSize: 12,
    color: Colors.text.secondary,
    flex: 1,
  },
  hargaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  hargaLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  hargaText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  paymentStatus: {
    marginTop: 4,
  },
  paymentText: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: "500",
  },
  paymentLunas: {
    color: Colors.success,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyOrderContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyOrderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyOrderText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyOrderSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
