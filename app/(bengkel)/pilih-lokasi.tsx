import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../../src/constants/colors";

export default function PilihLokasiScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Initial coordinates from params or default to a central location
  const initialLatitude = params.latitude
    ? parseFloat(params.latitude as string)
    : 3.595196;
  const initialLongitude = params.longitude
    ? parseFloat(params.longitude as string)
    : 98.672226;

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>({ latitude: initialLatitude, longitude: initialLongitude });

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      router.replace({
        pathname: "setup-bengkel", // Relative path to the screen in the same group
        params: {
          latitude: selectedLocation.latitude.toString(),
          longitude: selectedLocation.longitude.toString(),
        },
      });
    } else {
      Alert.alert("Lokasi Belum Dipilih", "Silakan pilih lokasi di peta.");
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        <UrlTile
          urlTemplate="https://openfreemap.org/styles/positron/{z}/{x}/{y}.png"
          maximumZ={19}
        />
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Lokasi Bengkel"
            description="Lokasi yang Anda pilih"
          />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmLocation}
        >
          <Text style={styles.confirmButtonText}>Pilih Lokasi Ini</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.push('/setup-bengkel')}
        >
          <Text style={styles.cancelButtonText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "transparent",
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
