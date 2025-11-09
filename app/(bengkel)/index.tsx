/**
 * Beranda Bengkel
 */

import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";
import { checkBengkelStatus } from "../../src/utils/bengkelHelper";

export default function BengkelHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const bengkelStatus = checkBengkelStatus(user);

  // Function untuk handle lengkapi data
  const handleLengkapiData = () => {
    router.push("/(bengkel)/setup-bengkel" as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Selamat Datang! 🔧</Text>
        <Text style={styles.name}>{user?.nama}</Text>
        <Text style={styles.role}>Bengkel</Text>
      </View>

      <View style={styles.content}>
        {/* Alert/Notification Box */}
        {!bengkelStatus.isVerified && (
          <View
            style={[
              styles.alertBox,
              bengkelStatus.type === "warning" && styles.alertWarning,
              bengkelStatus.type === "error" && styles.alertError,
            ]}
          >
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertIcon}>
                {bengkelStatus.type === "warning" ? "⚠️" : "❌"}
              </Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {!bengkelStatus.hasData
                  ? "Data Bengkel Belum Lengkap"
                  : "Menunggu Verifikasi"}
              </Text>
              <Text style={styles.alertMessage}>{bengkelStatus.message}</Text>

              {!bengkelStatus.hasData && (
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={handleLengkapiData}
                >
                  <Text style={styles.alertButtonText}>Lengkapi Data</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Placeholder Content */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Dashboard Bengkel akan ditampilkan di sini
          </Text>
        </View>
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
  // Alert Box Styles
  alertBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertWarning: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alertError: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  alertIconContainer: {
    marginRight: 12,
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  alertButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  // Info Card Styles (Verified)
  infoCard: {
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
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  verifiedIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  verifiedText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  // Placeholder
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});
