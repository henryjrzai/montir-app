/**
 * Kelola Montir Bengkel
 */

import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../src/constants/colors";

interface Montir {
  id: number;
  nama: string;
  no_telp: string;
  email: string;
}

export default function MontirScreen() {
  const router = useRouter();
  const [montirList, setMontirList] = useState<Montir[]>([
    {
      id: 1,
      nama: "Ahmad Rifai",
      no_telp: "081234567890",
      email: "ahmad@example.com",
    },
    {
      id: 2,
      nama: "Budi Santoso",
      no_telp: "082345678901",
      email: "budi@example.com",
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    no_telp: "",
    email: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAdd = () => {
    if (
      !formData.nama.trim() ||
      !formData.no_telp.trim() ||
      !formData.email.trim()
    ) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    const newMontir: Montir = {
      id: Date.now(),
      ...formData,
    };

    setMontirList([...montirList, newMontir]);
    setFormData({ nama: "", no_telp: "", email: "" });
    setShowAddForm(false);
    Alert.alert("Berhasil", "Montir berhasil ditambahkan");
  };

  const handleEdit = (montir: Montir) => {
    setEditingId(montir.id);
    setFormData({
      nama: montir.nama,
      no_telp: montir.no_telp,
      email: montir.email,
    });
    setShowAddForm(true);
  };

  const handleSaveEdit = () => {
    if (
      !formData.nama.trim() ||
      !formData.no_telp.trim() ||
      !formData.email.trim()
    ) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    setMontirList(
      montirList.map((item) =>
        item.id === editingId ? { ...item, ...formData } : item
      )
    );
    setEditingId(null);
    setFormData({ nama: "", no_telp: "", email: "" });
    setShowAddForm(false);
    Alert.alert("Berhasil", "Data montir berhasil diupdate");
  };

  const handleDelete = (id: number) => {
    Alert.alert("Konfirmasi", "Apakah Anda yakin ingin menghapus montir ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          setMontirList(montirList.filter((item) => item.id !== id));
          Alert.alert("Berhasil", "Montir berhasil dihapus");
        },
      },
    ]);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ nama: "", no_telp: "", email: "" });
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

      <ScrollView style={styles.content}>
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

        {/* Add/Edit Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId ? "Edit Montir" : "Tambah Montir Baru"}
            </Text>

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

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editingId ? handleSaveEdit : handleAdd}
              >
                <Text style={styles.saveButtonText}>
                  {editingId ? "Update" : "Simpan"}
                </Text>
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
                      {montir.nama.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.montirInfo}>
                    <Text style={styles.montirName}>{montir.nama}</Text>
                    <Text style={styles.montirContact}>
                      📱 {montir.no_telp}
                    </Text>
                    <Text style={styles.montirContact}>✉️ {montir.email}</Text>
                  </View>
                </View>
                <View style={styles.montirActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(montir)}
                  >
                    <Text style={styles.editButtonText}>✏️ Edit</Text>
                  </TouchableOpacity>
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
  editButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.info + "20",
    alignItems: "center",
  },
  editButtonText: {
    color: Colors.info,
    fontSize: 14,
    fontWeight: "600",
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
