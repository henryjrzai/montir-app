/**
 * Kelola Layanan Bengkel
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
import { layananService } from "../../src/services/layanan.service";
import { LayananBengkelItem } from "../../src/types/layanan.types";

export default function LayananScreen() {
  const router = useRouter();
  const [layananList, setLayananList] = useState<LayananBengkelItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLayanan, setNewLayanan] = useState("");
  const [newHarga, setNewHarga] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLayanan, setEditLayanan] = useState("");
  const [editHarga, setEditHarga] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load layanan on mount
  useEffect(() => {
    loadLayanan();
  }, []);

  const loadLayanan = async () => {
    try {
      const response = await layananService.getLayananList();
      if (response.status) {
        setLayananList(response.data);
      } else {
        Alert.alert("Error", response.message || "Gagal memuat data layanan");
      }
    } catch (error: any) {
      console.error("Error loading layanan:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal memuat data layanan"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLayanan();
  };

  const handleAdd = async () => {
    if (!newLayanan.trim()) {
      Alert.alert("Error", "Nama layanan tidak boleh kosong");
      return;
    }

    if (!newHarga.trim()) {
      Alert.alert("Error", "Harga layanan tidak boleh kosong");
      return;
    }

    const harga = parseInt(newHarga);
    if (isNaN(harga) || harga <= 0) {
      Alert.alert("Error", "Harga harus berupa angka yang valid");
      return;
    }

    setSubmitting(true);
    try {
      // Call API to create layanan
      const response = await layananService.createLayanan([
        {
          nama: newLayanan,
          harga: harga,
        },
      ]);

      if (response.status) {
        // Update list with new data from server
        setLayananList(response.data.layanan);
        setNewLayanan("");
        setNewHarga("");
        setShowAddForm(false);
        Alert.alert("Berhasil", response.message);
      } else {
        Alert.alert("Error", response.message || "Gagal menambahkan layanan");
      }
    } catch (error: any) {
      console.error("Error adding layanan:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal menambahkan layanan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id: number) => {
    const item = layananList.find((l) => l.id === id);
    if (item) {
      setEditingId(id);
      setEditLayanan(item.jenis_layanan);
      setEditHarga(item.harga.toString());
    }
  };

  const handleSaveEdit = async () => {
    if (!editLayanan.trim()) {
      Alert.alert("Error", "Nama layanan tidak boleh kosong");
      return;
    }

    if (!editHarga.trim()) {
      Alert.alert("Error", "Harga layanan tidak boleh kosong");
      return;
    }

    const harga = parseInt(editHarga);
    if (isNaN(harga) || harga <= 0) {
      Alert.alert("Error", "Harga harus berupa angka yang valid");
      return;
    }

    if (!editingId) return;

    setSubmitting(true);
    try {
      // Call API to update layanan
      const response = await layananService.updateLayanan(
        editingId,
        editLayanan,
        harga
      );

      if (response.status) {
        // Update list with updated data
        setLayananList(
          layananList.map((item) =>
            item.id === editingId ? response.data : item
          )
        );
        setEditingId(null);
        setEditLayanan("");
        setEditHarga("");
        Alert.alert("Berhasil", response.message);
      } else {
        Alert.alert("Error", response.message || "Gagal mengupdate layanan");
      }
    } catch (error: any) {
      console.error("Error updating layanan:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal mengupdate layanan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus layanan ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              // Call API to delete layanan
              const response = await layananService.deleteLayanan(id);

              if (response.status) {
                // Remove from list
                setLayananList(layananList.filter((item) => item.id !== id));
                Alert.alert("Berhasil", response.message);
              } else {
                Alert.alert(
                  "Error",
                  response.message || "Gagal menghapus layanan"
                );
              }
            } catch (error: any) {
              console.error("Error deleting layanan:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Gagal menghapus layanan"
              );
            }
          },
        },
      ]
    );
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
        <Text style={styles.title}>Kelola Layanan</Text>
        <Text style={styles.subtitle}>
          Atur layanan yang tersedia di bengkel Anda
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Memuat data layanan...</Text>
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
              <Text style={styles.addButtonText}>Tambah Layanan Baru</Text>
            </TouchableOpacity>
          )}

          {/* Add Form */}
          {showAddForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Tambah Layanan Baru</Text>
              <TextInput
                style={styles.input}
                placeholder="Nama layanan (contoh: Ganti Oli)"
                value={newLayanan}
                onChangeText={setNewLayanan}
                editable={!submitting}
              />
              <TextInput
                style={styles.input}
                placeholder="Harga (contoh: 50000)"
                value={newHarga}
                onChangeText={setNewHarga}
                keyboardType="numeric"
                editable={!submitting}
              />
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddForm(false);
                    setNewLayanan("");
                    setNewHarga("");
                  }}
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

          {/* Layanan List */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>
              Daftar Layanan ({layananList.length})
            </Text>

            {layananList.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔧</Text>
                <Text style={styles.emptyText}>Belum ada layanan</Text>
                <Text style={styles.emptySubtext}>
                  Tambahkan layanan yang tersedia di bengkel Anda
                </Text>
              </View>
            ) : (
              layananList.map((item) => (
                <View key={item.id} style={styles.layananCard}>
                  {editingId === item.id ? (
                    // Edit Mode
                    <View style={styles.editForm}>
                      <TextInput
                        style={styles.editInput}
                        value={editLayanan}
                        onChangeText={setEditLayanan}
                        placeholder="Nama layanan"
                        editable={!submitting}
                        autoFocus
                      />
                      <TextInput
                        style={styles.editInput}
                        value={editHarga}
                        onChangeText={setEditHarga}
                        placeholder="Harga"
                        keyboardType="numeric"
                        editable={!submitting}
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          style={styles.editCancelButton}
                          onPress={() => {
                            setEditingId(null);
                            setEditLayanan("");
                            setEditHarga("");
                          }}
                          disabled={submitting}
                        >
                          <Text style={styles.editCancelText}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.editSaveButton,
                            submitting && styles.editSaveButtonDisabled,
                          ]}
                          onPress={handleSaveEdit}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <ActivityIndicator
                              size="small"
                              color={Colors.white}
                            />
                          ) : (
                            <Text style={styles.editSaveText}>Simpan</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    // View Mode
                    <>
                      <View style={styles.layananInfo}>
                        <Text style={styles.layananIcon}>🔧</Text>
                        <View>
                          <Text style={styles.layananName}>
                            {item.jenis_layanan}{" "}
                          </Text>
                          <Text style={{ fontStyle: "italic" }}>
                            {item.harga
                              ? `Rp.${item.harga.toLocaleString()}`
                              : ""}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.layananActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEdit(item.id)}
                        >
                          <Text style={styles.editButtonText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDelete(item.id)}
                        >
                          <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
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
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
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
  layananCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  layananInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  layananIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  layananName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
    flex: 1,
  },
  layananActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 20,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  editForm: {
    flex: 1,
  },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  editCancelButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    alignItems: "center",
  },
  editCancelText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  editSaveButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  editSaveButtonDisabled: {
    backgroundColor: Colors.gray[300],
    opacity: 0.6,
  },
  editSaveText: {
    color: Colors.white,
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
