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
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  // State for 'Selesai' modal
  const [isSelesaiModalVisible, setIsSelesaiModalVisible] = useState(false);
  const [hargaLayanan, setHargaLayanan] = useState("");
  const [itemServices, setItemServices] = useState<
    { nama_item: string; harga: string }[]
  >([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemHarga, setNewItemHarga] = useState("");

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
        setHargaLayanan(response.data.layanan_bengkel.harga.toString() || "");
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
    console.log("Refreshed order detail");
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
                error.response?.data?.message || "Gagal mengubah status order."
              );
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  // Update status to 'kerjakan'
  const handleUpdateStatusKerjakan = async () => {
    if (isUpdating) return;

    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin mengubah status menjadi 'Dikerjakan'?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          onPress: async () => {
            setIsUpdating(true);
            try {
              const response = await OrderService.updateStatusToKerjakan(
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
                error.response?.data?.message || "Gagal mengubah status order."
              );
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  // Handle add item service in modal
  const handleAddItemService = () => {
    if (!newItemName || !newItemHarga) {
      Alert.alert("Error", "Nama dan harga item tidak boleh kosong.");
      return;
    }
    if (isNaN(Number(newItemHarga))) {
      Alert.alert("Error", "Harga item harus berupa angka.");
      return;
    }
    setItemServices([
      ...itemServices,
      { nama_item: newItemName, harga: newItemHarga },
    ]);
    setNewItemName("");
    setNewItemHarga("");
  };

  // Handle remove item service in modal
  const handleRemoveItemService = (index: number) => {
    const newItems = [...itemServices];
    newItems.splice(index, 1);
    setItemServices(newItems);
  };

  // Update status to 'selesai' with payload
  const handleUpdateStatusSelesai = async () => {
    if (isUpdating) return;

    if (!hargaLayanan || isNaN(Number(hargaLayanan))) {
      Alert.alert("Error", "Harga layanan tidak valid.");
      return;
    }
    if (
      itemServices.some(
        (item) => !item.nama_item || !item.harga || isNaN(Number(item.harga))
      )
    ) {
      Alert.alert(
        "Error",
        "Ada item service yang tidak valid. Pastikan nama dan harga terisi dengan benar."
      );
      return;
    }

    const payload = {
      harga_layanan: Number(hargaLayanan),
      item_service: itemServices.map((item) => ({
        nama_item: item.nama_item,
        harga: Number(item.harga),
      })),
    };

    setIsUpdating(true);
    try {
      const response = await OrderService.updateStatusToSelesai(
        Number(orderId),
        payload
      );
      if (response.status) {
        Alert.alert(
          "Sukses",
          "Status order berhasil diubah dan rincian biaya disimpan."
        );
        setIsSelesaiModalVisible(false);
        setHargaLayanan("");
        setItemServices([]);
        await onRefresh();
      }
    } catch (error: any) {
      console.error(
        "[MontirOrderDetail] Failed to update status to selesai:",
        error
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal menyelesaikan order."
      );
    } finally {
      setIsUpdating(false);
    }
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
    const biayaAdmin = Number(orderData.biaya_admin || 0);

    return itemServicesTotal + layananHarga + biayaAdmin;
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
              <Text style={styles.orderIdText}>{orderData.kode_order}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                orderData.status === "menunggu" && styles.statusMenunggu,
                orderData.status === "kelokasi" && styles.statusKelokasi,
                orderData.status === "kerjakan" && styles.statusKerjakan,
                orderData.status === "pembayaran" && styles.statusPembayaran,
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
                  : orderData.status === "pembayaran"
                  ? "💰 Pembayaran"
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
            <View>
              <Text style={styles.layananName}>
                {orderData.layanan_bengkel.jenis_layanan}
              </Text>
              <Text>Rp. {orderData.layanan_bengkel.harga.toLocaleString("id-ID")}</Text>
            </View>
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
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => {
                router.push({
                  pathname: "/chat/[orderId]",
                  params: {
                    orderId: orderId,
                    orderCode: orderData.kode_order,
                    partnerName: orderData.pelanggan.nama || "Pelanggan",
                    partnerRole: "Pelanggan",
                  },
                });
              }}
            >
              <Text style={styles.chatButtonText}>💬 Chat Pelanggan</Text>
            </TouchableOpacity>
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
            <Text style={styles.cardTitle}>Rincian Item Service Tambahan</Text>
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
        {(orderData.status === "pembayaran" ||
          orderData.status === "selesai") && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ringkasan Pembayaran</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Harga Layanan:</Text>
              <Text style={styles.paymentValue}>
                Rp{" "}
                {Number(orderData.harga_layanan || 0).toLocaleString("id-ID")}
              </Text>
            </View>
            {orderData.item_service.length > 0 && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Item Service:</Text>
                <Text style={styles.paymentValue}>
                  Rp{" "}
                  {orderData.item_service
                    .reduce((sum, item) => sum + Number(item.harga), 0)
                    .toLocaleString("id-ID")}
                </Text>
              </View>
            )}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Biaya Layanan Admin:</Text>
              <Text style={styles.paymentValue}>
                Rp{" "}
                {Number(orderData.biaya_admin || 0).toLocaleString("id-ID")}
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
                  orderData.status_pembayaran === "paid" &&
                    styles.paymentStatusLunas,
                ]}
              >
                <Text style={styles.paymentStatusText}>
                  {orderData.status_pembayaran === "paid"
                    ? "✓ Lunas"
                    : "⏳ Belum Lunas"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

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
            style={[
              styles.mapsButton,
              { backgroundColor: Colors.primary },
              isUpdating && styles.disabledButton,
            ]}
            onPress={handleUpdateStatusKerjakan}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.mapsButtonText}>🔧 Kerjakan</Text>
            )}
          </TouchableOpacity>
        )}

        {orderData.status === "kerjakan" && (
          <TouchableOpacity
            style={[
              styles.mapsButton,
              { backgroundColor: Colors.success },
              isUpdating && styles.disabledButton,
            ]}
            onPress={() => setIsSelesaiModalVisible(true)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.mapsButtonText}>✅ Selesai</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Selesai Order Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSelesaiModalVisible}
        onRequestClose={() => {
          setIsSelesaiModalVisible(!isSelesaiModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selesaikan Order</Text>

            <ScrollView>
              {/* Harga Layanan */}
              <Text style={styles.modalLabel}>Harga Jasa Layanan</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Contoh: 50000"
                keyboardType="numeric"
                value={hargaLayanan}
                readOnly={true}
                onChangeText={setHargaLayanan}
              />

              {/* Item Services */}
              <Text style={styles.modalLabel}>Item Service Tambahan</Text>
              {itemServices.map((item, index) => (
                <View key={index} style={styles.addedItemRow}>
                  <Text style={styles.addedItemText}>
                    {index + 1}. {item.nama_item} - Rp{" "}
                    {Number(item.harga).toLocaleString("id-ID")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItemService(index)}
                  >
                    <Text style={styles.removeItemButton}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {itemServices.length === 0 && (
                <Text style={styles.noItemsText}>
                  Belum ada item service tambahan.
                </Text>
              )}

              {/* Add New Item Form */}
              <View style={styles.addItemForm}>
                <TextInput
                  style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                  placeholder="Nama Item"
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="Harga"
                  keyboardType="numeric"
                  value={newItemHarga}
                  onChangeText={setNewItemHarga}
                />
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={handleAddItemService}
                >
                  <Text style={styles.addItemButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Modal Action Buttons */}
            <View style={styles.modalActionContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsSelesaiModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonSave,
                  isUpdating && styles.disabledButton,
                ]}
                onPress={handleUpdateStatusSelesai}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.modalButtonText}>
                    Simpan & Selesaikan
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
    fontSize: 16,
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
  statusPembayaran: {
    backgroundColor: Colors.warning + "20",
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
    marginTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.background,
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  addedItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  addedItemText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  removeItemButton: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: "600",
  },
  noItemsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    marginVertical: 16,
    fontStyle: "italic",
  },
  addItemForm: {
    flexDirection: "row",
    // alignItems: "center",
    marginTop: 16,
  },
  addItemButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  addItemButtonText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  chatButton: {
    backgroundColor: Colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  chatButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  modalActionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: Colors.gray[200],
    marginRight: 8,
  },
  modalButtonSave: {
    backgroundColor: Colors.success,
    marginLeft: 8,
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});
