/**
 * Beranda Montir
 */

import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";
import { montirService } from "../../src/services/montir.service";
import { MontirOrder } from "../../src/types/montir.types";
import MontirRatingChart from "../../src/components/MontirRatingChart";
import RatingDetailModal from "../../src/components/RatingDetailModal";
import { BengkelService } from "../../src/services/bengkel.service";

export default function MontirHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const bengkel = user?.bengkel || user?.montir?.bengkel;
  const [orders, setOrders] = useState<MontirOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Load order list
  const loadOrders = useCallback(async () => {
    const montirId = user?.montir?.id;
    if (!montirId) {
      setLoading(false);
      return;
    }

    try {
      const response = await montirService.getMontirOrderList(montirId);
      if (response.status && response.data) {
        setOrders(response.data);
      }
      const ratingResponse = await BengkelService.getMontirRatings();
      if (ratingResponse.status && ratingResponse.data) {
        setMontirRatings(ratingResponse.data);
      }
    } catch (error: any) {
      console.error("[MontirHome] Failed to load orders:", error);
      Alert.alert("Error", "Gagal memuat daftar order");
    } finally {
      setLoading(false);
    }
  }, [user?.montir?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  // Calculate total price
  const calculateTotal = (order: MontirOrder) => {
    const itemServicesTotal = order.item_service.reduce(
      (sum, item) => sum + Number(item.harga),
      0
    );
    return itemServicesTotal + Number(order.harga_layanan || 0);
  };

  // Navigate to order detail
  const handleOrderPress = (orderId: number) => {
    router.push({
      pathname: "/(montir)/order-detail",
      params: { orderId: orderId.toString() },
    });
  };

  // Render order item
  const renderOrderItem = ({ item }: { item: MontirOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item.id)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order {item.kode_order}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "menunggu" && styles.statusMenunggu,
            item.status === "kelokasi" && styles.statusKelokasi,
            item.status === "kerjakan" && styles.statusKerjakan,
            item.status === "pembayaran" && styles.statusPembayaran,
            item.status === "selesai" && styles.statusSelesai,
            item.status === "batal" && styles.statusBatal,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === "menunggu"
              ? "⏳ Menunggu"
              : item.status === "kelokasi"
              ? "🚗 Ke Lokasi"
              : item.status === "kerjakan"
              ? "🔧 Dikerjakan"
              : item.status === "pembayaran"
              ? "💰 Pembayaran"
              : item.status === "selesai"
              ? "✅ Selesai"
              : "❌ Batal"}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.layananBox}>
          <Text style={styles.layananIcon}>🔧</Text>
          <Text style={styles.layananText}>
            {item.layanan_bengkel.jenis_layanan}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👤 Pelanggan:</Text>
          <Text style={styles.infoValue}>{item.pelanggan.nama}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 No. Telp:</Text>
          <Text style={styles.infoValue}>{item.pelanggan.no_telp}</Text>
        </View>

        {item.status_pembayaran === "lunas" && (
          <View style={styles.paymentBadge}>
            <Text style={styles.paymentText}>✓ Lunas</Text>
          </View>
        )}
      </View>

      {item.ulasan_rating && (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewLabel}>
            ⭐ Rating: {item.ulasan_rating.rating}/5
          </Text>
          <Text style={styles.reviewText} numberOfLines={2}>
            {item.ulasan_rating.ulasan}
          </Text>
        </View>
      )}

      <View style={styles.detailButtonContainer}>
        <Text style={styles.detailButtonText}>Lihat Detail →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
      >
      <View style={styles.header}>
        <Text style={styles.greeting}>Selamat Datang! 🛠️</Text>
        <Text style={styles.name}>{user?.nama}</Text>
        <Text style={styles.role}>Montir</Text>
        {bengkel && (
          <View style={styles.bengkelInfo}>
            <Text style={styles.bengkelLabel}>🏢 Bekerja di:</Text>
            <Text style={styles.bengkelName}>{bengkel.nama}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {montirRatings.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <MontirRatingChart
              data={montirRatings}
              onDataPointClick={handleDataPointClick}
            />
          </View>
        )}
        <View style={styles.titleBar}>
          <Text style={styles.contentTitle}>Daftar Order Saya</Text>
          <Text style={styles.orderCount}>
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Memuat daftar order...</Text>
          </View>
        ) : !user?.montir ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyText}>
              Anda belum terdaftar di bengkel
            </Text>
            <Text style={styles.emptySubtext}>
              Hubungi admin bengkel untuk mendaftarkan akun Anda
            </Text>
          </View>
        ) : orders.length > 0 ? (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              Belum ada order yang ditugaskan
            </Text>
            <Text style={styles.emptySubtext}>
              Order yang ditugaskan oleh bengkel akan muncul di sini
            </Text>
          </View>
        )}
      </View>
      <RatingDetailModal
        visible={modalVisible}
        onClose={closeModal}
        data={selectedMontir}
      />
    </ScrollView>
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
  bengkelInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
  },
  bengkelLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 4,
  },
  bengkelName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  orderCount: {
    fontSize: 14,
    color: Colors.text.secondary,
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
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
  orderInfo: {
    gap: 8,
  },
  layananBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  layananIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  layananText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
    flex: 1.5,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  paymentBadge: {
    marginTop: 8,
    backgroundColor: Colors.success + "20",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  paymentText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.success,
  },
  reviewBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.warning + "10",
    borderRadius: 8,
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  detailButtonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    alignItems: "center",
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});
