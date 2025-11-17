/**
 * Detail Order - Montir
 * Menampilkan detail orderan yang ditugaskan ke montir
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";
import { OrderService } from "../../src/services/order.service";
import { OrderDetail } from "../../src/types/order.types";

export default function MontirOrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load order detail
  const loadOrderDetail = useCallback(async () => {
    if (!orderId) {
      Alert.alert("Error", "Order ID tidak ditemukan");
      router.back();
      return;
    }

    try {
      const response = await OrderService.getOrderDetail(Number(orderId));
      if (response.status === "success" && response.data) {
        setOrderData(response.data);
      }
    } catch (error: any) {
      console.error("[MontirOrderDetail] Failed to load:", error);
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

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrderDetail();
    setRefreshing(false);
  }, [loadOrderDetail]);

  // Update status to 'kelokasi'
  const handleUpdateStatusKeLokasi = async () => {
    if (isUpdating) return;

    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin mengubah status menjadi 'Ke Lokasi'?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          onPress: async () => {
            setIsUpdating(true);
            try {
              const response = await OrderService.updateStatusToKeLokasi(
                Number(orderId)
              );
              if (response.status && response.data) {
                Alert.alert("Sukses", "Status order berhasil diubah.");
                await onRefresh();
              }
            } catch (error: any) {
              console.error(
                "[MontirOrderDetail] Failed to update status:",
                error
              );
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Gagal mengubah status order."
              );
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  // Open Google Maps dengan koordinat order
  const openMaps = () => {
    if (!orderData) return;

    const { latitude, longitude } = orderData;
    const label = encodeURIComponent(
      `Lokasi Order #${orderData.id} - ${orderData.pelanggan.nama}`
    );

    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}(${label})`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Linking.openURL(fallbackUrl);
          }
        })
        .catch(() => {
          Linking.openURL(fallbackUrl);
        });
    }
  };

  // Call pelanggan
  const callPelanggan = () => {
    if (!orderData) return;

    const phoneUrl = `tel:${orderData.pelanggan.no_telp}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert("Error", "Tidak dapat membuka aplikasi telepon");
        }
      })
      .catch((error) => {
        console.error("Failed to open phone:", error);
        Alert.alert("Error", "Gagal membuka aplikasi telepon");
      });
  };

  // Calculate total
  const calculateTotal = () => {
    if (!orderData) return 0;

    const itemServicesTotal = orderData.item_service.reduce(
      (sum, item) => sum + Number(item.harga),
      0
    );

    const layananHarga = Number(orderData.harga_layanan || 0);

    return itemServicesTotal + layananHarga;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat detail order...</Text>
      </View>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Order</Text>
        <View style={styles.placeholder} />
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
          />
        }
      >
        {/* Order ID & Status */}
        <View style={styles.card}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderIdText}>#{orderData.id}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                orderData.status === "menunggu" && styles.statusMenunggu,
                orderData.status === "kelokasi" && styles.statusKelokasi,
                orderData.status === "kerjakan" && styles.statusKerjakan,
                orderData.status === "selesai" && styles.statusSelesai,
                orderData.status === "batal" && styles.statusBatal,
              ]}
            >
              <Text style={styles.statusText}>
                {orderData.status === "menunggu"
                  ? "⏳ Menunggu"
                  : orderData.status === "kelokasi"
                  ? "🚗 Ke Lokasi"
                  : orderData.status === "kerjakan"
                  ? "🔧 Dikerjakan"
                  : orderData.status === "selesai"
                  ? "✅ Selesai"
                  : "❌ Batal"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Waktu Order */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Waktu Order:</Text>
            <Text style={styles.infoValue}>
              {new Date(orderData.created_at).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Text>
          </View>
        </View>

        {/* Layanan Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Layanan yang Dipesan</Text>
          <View style={styles.layananBox}>
            <Text style={styles.layananIcon}>🔧</Text>
            <Text style={styles.layananName}>
              {orderData.layanan_bengkel.jenis_layanan}
            </Text>
          </View>
        </View>

        {/* Pelanggan Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Pelanggan</Text>
          <View style={styles.pelangganInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nama:</Text>
              <Text style={styles.infoValue}>{orderData.pelanggan.nama}</Text>
            </View>
            <TouchableOpacity style={styles.infoRow} onPress={callPelanggan}>
              <Text style={styles.infoLabel}>No. Telepon:</Text>
              <Text style={styles.phoneValue}>
                📱 {orderData.pelanggan.no_telp}
              </Text>
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{orderData.pelanggan.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alamat:</Text>
              <Text style={styles.infoValueMultiline}>
                {orderData.pelanggan.alamat}
              </Text>
            </View>
          </View>
        </View>

        {/* Lokasi Order */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lokasi Order</Text>
          <View style={styles.lokasiBox}>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>Latitude:</Text>
              <Text style={styles.coordinateValue}>
                {parseFloat(orderData.latitude).toFixed(6)}
              </Text>
            </View>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>Longitude:</Text>
              <Text style={styles.coordinateValue}>
                {parseFloat(orderData.longitude).toFixed(6)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
            <Text style={styles.mapsButtonText}>🗺️ Buka di Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Bengkel Info */}
        {orderData.montir?.bengkel && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informasi Bengkel</Text>
            <View style={styles.bengkelInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nama Bengkel:</Text>
                <Text style={styles.infoValue}>
                  {orderData.montir.bengkel.nama}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Alamat:</Text>
                <Text style={styles.infoValueMultiline}>
                  {orderData.montir.bengkel.alamat}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Item Services */}
        {orderData.item_service.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rincian Item Service</Text>
            {orderData.item_service.map((item, index) => (
              <View key={item.id} style={styles.itemServiceRow}>
                <View style={styles.itemServiceLeft}>
                  <Text style={styles.itemServiceNumber}>{index + 1}.</Text>
                  <Text style={styles.itemServiceName}>{item.nama_item}</Text>
                </View>
                <Text style={styles.itemServicePrice}>
                  Rp {item.harga.toLocaleString("id-ID")}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal Item Service:</Text>
              <Text style={styles.subtotalValue}>
                Rp{" "}
                {orderData.item_service
                  .reduce((sum, item) => sum + Number(item.harga), 0)
                  .toLocaleString("id-ID")}
              </Text>
            </View>
          </View>
        )}

        {/* Ringkasan Pembayaran */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ringkasan Pembayaran</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Harga Layanan:</Text>
            <Text style={styles.paymentValue}>
              Rp {Number(orderData.harga_layanan || 0).toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Item Service:</Text>
            <Text style={styles.paymentValue}>
              Rp{" "}
              {orderData.item_service
                .reduce((sum, item) => sum + Number(item.harga), 0)
                .toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              Rp {calculateTotal().toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.paymentStatusRow}>
            <Text style={styles.paymentStatusLabel}>Status Pembayaran:</Text>
            <View
              style={[
                styles.paymentStatusBadge,
                orderData.status_pembayaran === "lunas" &&
                  styles.paymentStatusLunas,
              ]}
            >
              <Text style={styles.paymentStatusText}>
                {orderData.status_pembayaran === "lunas"
                  ? "✓ Lunas"
                  : "⏳ Belum Lunas"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonContainer}>
          {orderData.status === "menunggu" && (
            <TouchableOpacity
              style={[
                styles.mapsButton,
                { backgroundColor: Colors.info },
                isUpdating && styles.disabledButton,
              ]}
              onPress={handleUpdateStatusKeLokasi}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.mapsButtonText}>🚗 Ke Lokasi</Text>
              )}
            </TouchableOpacity>
          )}

          {orderData.status === "kelokasi" && (
            <TouchableOpacity
              style={[styles.mapsButton, { backgroundColor: Colors.primary }]}
              onPress={() => {
                // TODO: Implement API call to change status to 'kerjakan'
                Alert.alert(
                  "Konfirmasi",
                  "Apakah Anda yakin ingin mengubah status menjadi 'Dikerjakan'?",
                  [
                    { text: "Batal", style: "cancel" },
                    {
                      text: "Ya",
                      onPress: () =>
                        console.log("Change status to kerjakan"),
                    },
                  ]
                );
              }}
            >
              <Text style={styles.mapsButtonText}>🔧 Kerjakan</Text>
            </TouchableOpacity>
          )}

          {orderData.status === "kerjakan" && (
            <TouchableOpacity
              style={[styles.mapsButton, { backgroundColor: Colors.success }]}
              onPress={() => {
                // TODO: Implement API call to change status to 'selesai'
                Alert.alert("Konfirmasi", "Apakah Anda yakin ingin mengubah status menjadi 'Selesai'?", [
                  { text: "Batal", style: "cancel" },
                  { text: "Ya", onPress: () => console.log("Change status to selesai") },
                ]);
              }}
            >
              <Text style={styles.mapsButtonText}>✅ Selesai</Text>
            </TouchableOpacity>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderIdLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
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
  statusBatal: {
    backgroundColor: Colors.error + "20",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 2,
    textAlign: "right",
  },
  infoValueMultiline: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 2,
    textAlign: "right",
  },
  layananBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    padding: 16,
    borderRadius: 8,
  },
  layananIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  layananName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    flex: 1,
  },
  pelangganInfo: {
    gap: 8,
  },
  phoneValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  lokasiBox: {
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  coordinateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  coordinateLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  coordinateValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  mapsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  mapsButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  bengkelInfo: {
    backgroundColor: Colors.primary + "10",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  itemServiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemServiceLeft: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  itemServiceNumber: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  itemServiceName: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  itemServicePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  subtotalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  paymentStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  paymentStatusLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  paymentStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.warning + "20",
  },
  paymentStatusLunas: {
    backgroundColor: Colors.success + "20",
  },
  paymentStatusText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  actionButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
});
