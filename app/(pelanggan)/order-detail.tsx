/**
 * Detail Order Pelanggan
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { Colors } from "../../src/constants/colors";
import { paymentService } from "../../src/services/payment.service";
import { pelangganService } from "../../src/services/pelanggan.service";
import { OrderDetail } from "../../src/types/pelanggan.types";

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const loadOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pelangganService.getOrderDetail(parseInt(orderId));
      if (response.status === "success") {
        setOrder(response.data);
      } else {
        Alert.alert("Error", "Gagal memuat detail order");
        router.back();
      }
    } catch (error: any) {
      console.error("Error loading order detail:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat detail order"
      );
      router.back();
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  const handleBayar = async () => {
    if (!order?.kode_order) {
      Alert.alert(
        "Error",
        "Kode order tidak ditemukan. Tidak dapat melanjutkan pembayaran."
      );
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await paymentService.createTransaction({
        kode_order: order.kode_order,
      });
      
      // --- DEBUGGING: Log the backend response ---
      console.log("Backend Response:", JSON.stringify(response, null, 2));
      // -----------------------------------------

      if (response.status && response.data.snap_token) {
        const url = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${response.data.snap_token}`;
        setPaymentUrl(url);
        setShowPaymentModal(true);
      } else {
        Alert.alert("Error", response.message || "Gagal memulai pembayaran.");
      }
    } catch (error: any) {
      console.error("Error creating payment transaction:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memulai pembayaran."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;
    if (!url) return;

    // Cek jika URL adalah URL callback dari Midtrans
    // Midtrans akan redirect ke URL dengan status di query params setelah pembayaran
    if (url.includes("?order_id=") && url.includes("&status_code=")) {
      setShowPaymentModal(false);
      setPaymentUrl("");

      // Beri sedikit jeda sebelum memuat ulang, agar backend sempat memproses notifikasi Midtrans
      setTimeout(() => {
        Alert.alert(
          "Info",
          "Mengecek status pembayaran terbaru...",
          [
            {
              text: "OK",
              onPress: () => loadOrderDetail(),
            },
          ],
          { cancelable: false }
        );
      }, 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "menunggu":
        return Colors.warning;
      case "kelokasi":
        return Colors.info;
      case "kerjakan":
        return "#9333ea";
      case "selesai":
        return Colors.success;
      case "batal":
        return Colors.error;
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "menunggu":
        return "⏳ Menunggu";
      case "kelokasi":
        return "🚗 Menuju Lokasi";
      case "kerjakan":
        return "🔧 Dikerjakan";
      case "selesai":
        return "✅ Selesai";
      case "batal":
        return "❌ Dibatalkan";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Order</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat detail order...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return null;
  }

  const totalItemService = order.item_service.reduce(
    (sum, item) => sum + Number(item.harga || 0),
    0
  );

  const totalHarga = totalItemService + Number(order.harga_layanan || 0);
  console.log(order)
  const showPaymentButton =
    order.status === "selesai" && order.status_pembayaran !== "paid";

  return (
    <SafeAreaView style={styles.container}>
      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
        animationType="slide"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lakukan Pembayaran</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.modalCloseButton}>Tutup</Text>
            </TouchableOpacity>
          </View>
          {paymentUrl ? (
            <WebView
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => (
                <ActivityIndicator
                  color={Colors.primary}
                  size="large"
                  style={styles.webViewLoader}
                />
              )}
            />
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Order</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadgeLarge,
              { backgroundColor: getStatusColor(order.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusTextLarge,
                { color: getStatusColor(order.status) },
              ]}
            >
              {getStatusLabel(order.status)}
            </Text>
          </View>
          <Text style={styles.orderIdText}>Order {order.kode_order}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Layanan Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Layanan</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jenis Layanan:</Text>
              <Text style={styles.infoValue}>
                {order.layanan_bengkel.jenis_layanan}
              </Text>
            </View>
          </View>
        </View>

        {/* Bengkel Info */}
        {order.montir && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Bengkel</Text>
            <View style={styles.card}>
              <Text style={styles.bengkelName}>
                {order.montir.bengkel.nama}
              </Text>
              <Text style={styles.bengkelAddress}>
                📍 {order.montir.bengkel.alamat}
              </Text>
            </View>
          </View>
        )}

        {/* Montir Info */}
        {order.montir && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Montir</Text>
            <View style={styles.card}>
              <View style={styles.montirHeader}>
                <View style={styles.montirAvatar}>
                  <Text style={styles.montirAvatarText}>
                    {order.montir.user.nama.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.montirInfo}>
                  <Text style={styles.montirName}>
                    {order.montir.user.nama}
                  </Text>
                  <Text style={styles.montirContact}>
                    📱 {order.montir.user.no_telp}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Item Service */}
        {order.item_service.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rincian Item Service</Text>
            <View style={styles.card}>
              {order.item_service.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.nama_item}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      Rp {item.harga.toLocaleString()}
                    </Text>
                  </View>
                  {index < order.item_service.length - 1 && (
                    <View style={styles.itemDivider} />
                  )}
                </View>
              ))}

              {/* Total Items */}
              <View style={styles.totalItemRow}>
                <Text style={styles.totalItemLabel}>Subtotal Item:</Text>
                <Text style={styles.totalItemValue}>
                  Rp {totalItemService.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pembayaran</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Harga Layanan:</Text>
              <Text style={styles.priceText}>
                Rp{" "}
                {order.harga_layanan
                  ? order.harga_layanan.toLocaleString()
                  : "0"}
              </Text>
            </View>
            {order.item_service.length > 0 && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Item Service:</Text>
                  <Text style={styles.priceText}>
                    Rp {totalItemService.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.totalLabel}>TOTAL HARGA:</Text>
                  <Text style={styles.totalPrice}>
                    Rp {totalHarga.toLocaleString()}
                  </Text>
                </View>
              </>
            )}
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status Pembayaran:</Text>
              <View
                style={[
                  styles.paymentBadge,
                  {
                    backgroundColor:
                      order.status_pembayaran === "paid"
                        ? Colors.success + "20"
                        : Colors.warning + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.paymentText,
                    {
                      color:
                        order.status_pembayaran === "lunas"
                          ? Colors.success
                          : order.status_pembayaran === "paid"
                          ? Colors.success
                          : Colors.warning,
                    },
                  ]}
                >
                  {order.status_pembayaran === "lunas" ||
                  order.status_pembayaran === "paid"
                    ? "Lunas"
                    : "Belum Lunas"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lokasi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lokasi Layanan</Text>
          <View style={styles.card}>
            <Text style={styles.infoLabel}>Koordinat:</Text>
            <Text style={styles.coordinateText}>
              📍 Lat: {order.latitude}, Long: {order.longitude}
            </Text>
          </View>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {showPaymentButton && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handleBayar}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.paymentButtonText}>Lakukan Pembayaran</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
    padding: 20,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  statusBadgeLarge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusTextLarge: {
    fontSize: 18,
    fontWeight: "bold",
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1,
    textAlign: "right",
  },
  bengkelName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  bengkelAddress: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  montirHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  montirAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  montirAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  montirInfo: {
    flex: 1,
  },
  montirName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  montirContact: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 4,
  },
  totalItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: Colors.gray[300],
  },
  totalItemLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  totalItemValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 12,
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  coordinateText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  footer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  paymentButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  paymentButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  modalCloseButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },
  webViewLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
