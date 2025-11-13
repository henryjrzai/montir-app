/**
 * Halaman Pencarian Bengkel
 */

import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";
import { pelangganService } from "../../src/services/pelanggan.service";
import { BengkelSearchItem } from "../../src/types/pelanggan.types";

export default function SearchBengkelScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [bengkelList, setBengkelList] = useState<BengkelSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Lokasi Ditolak",
          "Aplikasi memerlukan akses lokasi untuk mencari bengkel terdekat. Menggunakan lokasi default.",
          [{ text: "OK" }]
        );
        // Fallback ke lokasi default (Medan)
        setCurrentLocation({
          latitude: 3.544847021595764,
          longitude: 98.62332293803487,
        });
        setLocationLoading(false);
        return;
      }

      // Dapatkan lokasi saat ini
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLocationLoading(false);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Error",
        "Gagal mendapatkan lokasi. Menggunakan lokasi default."
      );
      // Fallback ke lokasi default
      setCurrentLocation({
        latitude: 3.544847021595764,
        longitude: 98.62332293803487,
      });
      setLocationLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Masukkan jenis layanan yang dicari");
      return;
    }

    if (!currentLocation) {
      Alert.alert("Error", "Lokasi belum tersedia. Mohon tunggu sebentar.");
      return;
    }

    setLoading(true);
    setBengkelList([]);

    try {
      console.log("[Search] Sending request:", {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        jenis_layanan: searchQuery,
      });

      const response = await pelangganService.cariBengkel({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        jenis_layanan: searchQuery,
      });

      console.log("[Search] Response:", response);

      if (response.status) {
        setBengkelList(response.data);
        if (response.total === 0) {
          Alert.alert(
            "Tidak Ditemukan",
            "Tidak ada bengkel yang menyediakan layanan ini di sekitar Anda."
          );
        }
      } else {
        Alert.alert("Error", response.message || "Gagal mencari bengkel");
      }
    } catch (error: any) {
      console.error("[Search] Full error:", error);
      console.error("[Search] Error response:", error.response);
      console.error("[Search] Error message:", error.message);

      let errorMessage = "Gagal mencari bengkel";

      if (error.message) {
        errorMessage = error.message;
      }

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBengkelPress = (bengkel: BengkelSearchItem) => {
    router.push(`/(pelanggan)/bengkel-detail?bengkelId=${bengkel.id}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cari Bengkel</Text>
        {currentLocation && (
          <Text style={styles.locationInfo}>
            📍 Lokasi: {currentLocation.latitude.toFixed(4)},{" "}
            {currentLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        {/* Search Box */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari layanan (contoh: Oli, Ban, Service)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              editable={!locationLoading && !loading}
            />
            <TouchableOpacity
              style={[
                styles.searchButton,
                (locationLoading || loading) && styles.searchButtonDisabled,
              ]}
              onPress={handleSearch}
              disabled={locationLoading || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.searchButtonText}>🔍 Cari</Text>
              )}
            </TouchableOpacity>
          </View>

          {locationLoading && (
            <View style={styles.locationLoadingBox}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.locationLoadingText}>
                Mendapatkan lokasi Anda...
              </Text>
            </View>
          )}
        </View>

        {/* Results */}
        <ScrollView style={styles.resultsContainer}>
          {bengkelList.length > 0 && (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  🎯 Ditemukan {bengkelList.length} bengkel
                </Text>
                <Text style={styles.resultsSubtitle}>
                  Untuk layanan: &ldquo;{searchQuery}&rdquo;
                </Text>
              </View>

              {bengkelList.map((bengkel) => (
                <TouchableOpacity
                  key={bengkel.id}
                  style={styles.bengkelCard}
                  onPress={() => handleBengkelPress(bengkel)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: bengkel.foto }}
                    style={styles.bengkelImage}
                  />
                  <View style={styles.bengkelInfo}>
                    <Text style={styles.bengkelName}>{bengkel.nama}</Text>
                    <Text style={styles.bengkelDistance}>
                      🚗 {bengkel.jarak}
                    </Text>
                    <Text style={styles.bengkelAddress}>
                      📍 {bengkel.alamat}
                    </Text>

                    {/* Layanan Tags */}
                    <View style={styles.layananContainer}>
                      {bengkel.layanan.map((layanan, index) => (
                        <View key={index} style={styles.layananTag}>
                          <Text style={styles.layananTagText}>{layanan}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Arrow Indicator */}
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {!loading && bengkelList.length === 0 && searchQuery && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Belum ada hasil pencarian</Text>
              <Text style={styles.emptySubtext}>
                Coba cari layanan lain atau ubah kata kunci pencarian
              </Text>
            </View>
          )}

          {!loading && !searchQuery && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏪</Text>
              <Text style={styles.emptyText}>Cari Bengkel Terdekat</Text>
              <Text style={styles.emptySubtext}>
                Masukkan jenis layanan yang Anda butuhkan untuk menemukan
                bengkel terdekat
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
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
    marginBottom: 8,
  },
  locationInfo: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  searchBox: {
    flexDirection: "row",
    gap: 12,
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
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 90,
  },
  searchButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  locationLoadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.primary + "10",
    borderRadius: 8,
    gap: 8,
  },
  locationLoadingText: {
    fontSize: 14,
    color: Colors.primary,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
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
    width: 90,
    height: 90,
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
    marginBottom: 6,
  },
  bengkelDistance: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "700",
    marginBottom: 4,
  },
  bengkelAddress: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  layananContainer: {
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
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
  },
  arrowText: {
    fontSize: 24,
    color: Colors.gray[400],
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
