/**
 * Beranda Pelanggan
 */

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";
import { pelangganService } from "../../src/services/pelanggan.service";
import {
  BengkelSearchItem,
  OrderHistoryItem,
} from "../../src/types/pelanggan.types";

export default function PelangganHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [bengkelList, setBengkelList] = useState<BengkelSearchItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock location - in production, use react-native-geolocation
  const currentLocation = {
    latitude: 3.544847021595764,
    longitude: 98.62332293803487,
  };

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      const response = await pelangganService.getOrderHistory();
      if (response.status === "success") {
        setOrderHistory(response.data);
      }
    } catch (error: any) {
      console.error("Error loading order history:", error);
      // Silent fail for history
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Masukkan jenis layanan yang dicari");
      return;
    }

    setLoadingSearch(true);
    try {
      const response = await pelangganService.cariBengkel({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        jenis_layanan: searchQuery,
      });

      if (response.status) {
        setBengkelList(response.data);
        if (response.total === 0) {
          Alert.alert("Info", "Tidak ada bengkel ditemukan untuk layanan ini");
        }
      } else {
        Alert.alert("Error", response.message || "Gagal mencari bengkel");
      }
    } catch (error: any) {
      console.error("Error searching bengkel:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal mencari bengkel"
      );
    } finally {
      setLoadingSearch(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrderHistory();
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Selamat Datang! 👋</Text>
        <Text style={styles.name}>{user?.nama}</Text>
        <Text style={styles.role}>Pelanggan</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>🔍 Cari Bengkel Terdekat</Text>
          <Text style={styles.sectionSubtitle}>
            Temukan bengkel terdekat berdasarkan layanan
          </Text>

          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari layanan (contoh: Oli, Ban, Service)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={loadingSearch}
            >
              {loadingSearch ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.searchButtonText}>Cari</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bengkel Results */}
          {bengkelList.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>
                Ditemukan {bengkelList.length} bengkel
              </Text>
              {bengkelList.map((bengkel) => (
                <View key={bengkel.id} style={styles.bengkelCard}>
                  <Image
                    source={{ uri: bengkel.foto }}
                    style={styles.bengkelImage}
                  />
                  <View style={styles.bengkelInfo}>
                    <Text style={styles.bengkelName}>{bengkel.nama}</Text>
                    <Text style={styles.bengkelAddress}>
                      📍 {bengkel.alamat}
                    </Text>
                    <Text style={styles.bengkelDistance}>
                      🚗 {bengkel.jarak}
                    </Text>
                    <View style={styles.layananTags}>
                      {bengkel.layanan.map((layanan, index) => (
                        <View key={index} style={styles.layananTag}>
                          <Text style={styles.layananTagText}>{layanan}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Order History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>📋 Riwayat Orderan</Text>
          <Text style={styles.sectionSubtitle}>
            History orderan layanan bengkel Anda
          </Text>

          {loadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Memuat riwayat...</Text>
            </View>
          ) : orderHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Belum ada riwayat orderan</Text>
              <Text style={styles.emptySubtext}>
                Orderan Anda akan muncul di sini
              </Text>
            </View>
          ) : (
            orderHistory.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() =>
                  router.push(`/(pelanggan)/order-detail?orderId=${order.id}`)
                }
                activeOpacity={0.7}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderBody}>
                  <Text style={styles.bengkelNameHistory}>
                    {order.layanan_bengkel.bengkel.nama}
                  </Text>
                  <Text style={styles.layananName}>
                    🔧 {order.layanan_bengkel.jenis_layanan}
                  </Text>
                  <Text style={styles.orderAddress}>
                    📍 {order.layanan_bengkel.bengkel.alamat}
                  </Text>
                  {order.harga_layanan && (
                    <Text style={styles.orderPrice}>
                      💰 Rp {parseInt(order.harga_layanan).toLocaleString()}
                    </Text>
                  )}
                </View>

                {/* Tap Indicator */}
                <View style={styles.tapIndicator}>
                  <Text style={styles.tapText}>Tap untuk detail →</Text>
                </View>
              </TouchableOpacity>
            ))
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
  content: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  bengkelCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bengkelImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
  bengkelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bengkelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  bengkelAddress: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  bengkelDistance: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  layananTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  layananTag: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  layananTagText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "600",
  },
  historySection: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
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
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  orderDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderBody: {
    gap: 6,
  },
  bengkelNameHistory: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  layananName: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: "600",
  },
  orderAddress: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  orderPrice: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "bold",
    marginTop: 4,
  },
  tapIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    alignItems: "center",
  },
  tapText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
});
