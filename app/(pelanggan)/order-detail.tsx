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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import StarRating from "../../src/components/StarRating";
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

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [bengkelRating, setBengkelRating] = useState(0);
  const [bengkelUlasan, setBengkelUlasan] = useState("");
  const [montirRating, setMontirRating] = useState(0);
  const [montirUlasan, setMontirUlasan] = useState("");

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

  const handleSimpanUlasan = async () => {
    if (bengkelRating === 0 || montirRating === 0) {
      Alert.alert("Validasi", "Rating untuk bengkel dan montir harus diisi.");
      return;
    }

    setReviewLoading(true);
    try {
      const response = await pelangganService.berikanUlasan(parseInt(orderId), {
        rating: bengkelRating,
        ulasan: bengkelUlasan,
        rating_montir: montirRating,
        ulasan_montir: montirUlasan,
      });

      if (response.status) {
        Alert.alert("Sukses", "Ulasan Anda berhasil disimpan.");
        setShowReviewModal(false);
        loadOrderDetail(); // Refresh order details to show new review
      } else {
        Alert.alert("Error", response.message || "Gagal menyimpan ulasan.");
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan ulasan."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = (newNavState: any) => {
    const { url } = newNavState;
    if (!url) return;

    if (url.includes("?order_id=") && url.includes("&status_code=")) {
      setShowPaymentModal(false);
      setPaymentUrl("");

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
      case "pembayaran":
        return Colors.warning;
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
      case "pembayaran":
        return "💰 Pembayaran";
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
  const showPaymentButton =
    order.status === "pembayaran" && order.status_pembayaran !== "paid";
  const showReviewButton =
    order.status === "selesai" &&
    (order.status_pembayaran === "paid" ||
      order.status_pembayaran === "lunas") &&
    order.ulasan_rating == null;

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

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        onRequestClose={() => setShowReviewModal(false)}
        animationType="slide"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Beri Ulasan & Rating</Text>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Text style={styles.modalCloseButton}>Tutup</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.reviewContent}>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>
                Ulasan untuk Bengkel "{order.montir?.bengkel.nama}"
              </Text>
              <Text style={styles.reviewLabel}>Rating Bengkel</Text>
              <StarRating
                rating={bengkelRating}
                onSelectRating={setBengkelRating}
              />
              <Text style={styles.reviewLabel}>Ulasan Bengkel (Opsional)</Text>
              <TextInput
                style={styles.reviewInput}
                multiline
                numberOfLines={4}
                placeholder="Bagaimana pengalaman Anda dengan bengkel ini?"
                value={bengkelUlasan}
                onChangeText={setBengkelUlasan}
                maxLength={1000}
              />
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>
                Ulasan untuk Montir "{order.montir?.user.nama}"
              </Text>
              <Text style={styles.reviewLabel}>Rating Montir</Text>
              <StarRating
                rating={montirRating}
                onSelectRating={setMontirRating}
              />
              <Text style={styles.reviewLabel}>Ulasan Montir (Opsional)</Text>
              <TextInput
                style={styles.reviewInput}
                multiline
                numberOfLines={4}
                placeholder="Bagaimana kinerja montir yang menangani Anda?"
                value={montirUlasan}
                onChangeText={setMontirUlasan}
                maxLength={1000}
              />
            </View>

            <TouchableOpacity
              style={styles.submitReviewButton}
              onPress={handleSimpanUlasan}
              disabled={reviewLoading}
            >
              {reviewLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.paymentButtonText}>Kirim Ulasan</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => {
                      router.push({
                        pathname: "/chat/[orderId]",
                        params: {
                          orderId: orderId,
                          orderCode: order.kode_order,
                          partnerName: order.montir?.user.nama || "Montir",
                          partnerRole: "Montir",
                        },
                      });
                    }}
                  >
                    <Text style={styles.chatButtonText}>💬 Chat Montir</Text>
                  </TouchableOpacity>
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
        {(order.status === "pembayaran" || order.status === "selesai") && (
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
                          order.status_pembayaran === "lunas" ||
                          order.status_pembayaran === "paid"
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
        )}

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

      {showReviewButton && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => setShowReviewModal(true)}
          >
            <Text style={styles.paymentButtonText}>
              {order.ulasan_bengkel
                ? "Lihat/Ubah Ulasan"
                : "Beri Ulasan & Rating"}
            </Text>
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
    marginBottom: 8,
  },
  chatButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  chatButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  paymentButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  reviewButton: {
    backgroundColor: Colors.success,
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
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
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
  reviewContent: {
    padding: 20,
  },
  reviewSection: {
    marginBottom: 24,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 100,
    backgroundColor: Colors.white,
  },
  submitReviewButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
});
