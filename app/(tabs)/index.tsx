import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat Datang!</Text>
      <Text style={styles.subtitle}>Halo, {user?.nama}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
