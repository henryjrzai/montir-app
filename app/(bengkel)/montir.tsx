/**
 * Kelola Montir Bengkel
 */

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";
import { montirService } from "../../src/services/montir.service";
import { MontirBengkelItem } from "../../src/types/montir.types";

export default function MontirScreen() {
  const router = useRouter();
  const [montirList, setMontirList] = useState<MontirBengkelItem[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    no_telp: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load montir on mount
  useEffect(() => {
    loadMontir();
  }, []);

  const loadMontir = async () => {
    try {
      const response = await montirService.getMontirList();
      if (response.status) {
        setMontirList(response.data);
      } else {
        Alert.alert("Error", response.message || "Gagal memuat data montir");
      }
    } catch (error: any) {
      console.error("Error loading montir:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat data montir"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMontir();
  };

  const handleAdd = async () => {
    // Validation
    if (
      !formData.nama.trim() ||
      !formData.alamat.trim() ||
      !formData.no_telp.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.password_confirmation.trim()
    ) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      Alert.alert("Error", "Konfirmasi password tidak cocok");
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert("Error", "Password minimal 8 karakter");
      return;
    }

    setSubmitting(true);
    try {
      const response = await montirService.createMontir(formData);

      if (response.status) {
        // Reload list
        await loadMontir();
        setFormData({
          nama: "",
          alamat: "",
          no_telp: "",
          email: "",
          password: "",
          password_confirmation: "",
        });
        setShowAddForm(false);
        Alert.alert("Berhasil", response.message);
      } else {
        Alert.alert("Error", response.message || "Gagal menambahkan montir");
      }
    } catch (error: any) {
      console.error("Error adding montir:", error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join("\n");
        Alert.alert("Validation Error", errorMessages);
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Gagal menambahkan montir"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert("Konfirmasi", "Apakah Anda yakin ingin menghapus montir ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await montirService.deleteMontir(id);

            if (response.status) {
              // Remove from list
              setMontirList(montirList.filter((item) => item.id !== id));
              Alert.alert("Berhasil", response.message);
            } else {
              Alert.alert(
                "Error",
                response.message || "Gagal menghapus montir"
              );
            }
          } catch (error: any) {
            console.error("Error deleting montir:", error);
            Alert.alert(
              "Error",
              error.response?.data?.message || "Gagal menghapus montir"
            );
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      nama: "",
      alamat: "",
      no_telp: "",
      email: "",
      password: "",
      password_confirmation: "",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kelola Montir</Text>
        <Text style={styles.subtitle}>
          Atur daftar montir yang bekerja di bengkel Anda
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat data montir...</Text>
        </View>
      ) : (
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
          {/* Add Button */}
          {!showAddForm && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={styles.addButtonIcon}>➕</Text>
              <Text style={styles.addButtonText}>Tambah Montir Baru</Text>
            </TouchableOpacity>
          )}

          {/* Add Form */}
          {showAddForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Tambah Montir Baru</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Lengkap</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama lengkap"
                  value={formData.nama}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nama: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Alamat</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan alamat lengkap"
                  value={formData.alamat}
                  onChangeText={(text) =>
                    setFormData({ ...formData, alamat: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>No. Telepon</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08123456789"
                  value={formData.no_telp}
                  onChangeText={(text) =>
                    setFormData({ ...formData, no_telp: text })
                  }
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Konfirmasi Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ulangi password"
                  value={formData.password_confirmation}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password_confirmation: text })
                  }
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={submitting}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    submitting && styles.saveButtonDisabled,
                  ]}
                  onPress={handleAdd}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Simpan</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Montir List */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>
              Daftar Montir ({montirList.length})
            </Text>

            {montirList.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👨‍🔧</Text>
                <Text style={styles.emptyText}>Belum ada montir</Text>
                <Text style={styles.emptySubtext}>
                  Tambahkan montir yang bekerja di bengkel Anda
                </Text>
              </View>
            ) : (
              montirList.map((montir) => (
                <View key={montir.id} style={styles.montirCard}>
                  <View style={styles.montirHeader}>
                    <View style={styles.montirAvatar}>
                      <Text style={styles.montirAvatarText}>
                        {montir.user.nama.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.montirInfo}>
                      <Text style={styles.montirName}>{montir.user.nama}</Text>
                      <Text style={styles.montirContact}>
                        📱 {montir.user.no_telp}
                      </Text>
                      <Text style={styles.montirContact}>
                        ✉️ {montir.user.email}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.montirActions}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(montir.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️ Hapus</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  formCard: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray[300],
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  listSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  montirCard: {
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
  montirHeader: {
    flexDirection: "row",
    marginBottom: 12,
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
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  montirActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  deleteButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.error + "20",
    alignItems: "center",
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
