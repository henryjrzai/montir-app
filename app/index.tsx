import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Colors } from "../src/constants/colors";
import { useAuth } from "../src/contexts/AuthContext";
import { getRoleRoute } from "../src/utils/roleRouter";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect berdasarkan role user menggunakan helper
        router.replace(getRoleRoute(user.role) as any);
      } else {
        router.replace("/login" as any);
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});