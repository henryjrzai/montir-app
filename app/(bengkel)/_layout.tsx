/**
 * Layout untuk Role: Bengkel
 */

import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Colors } from "../../src/constants/colors";

export default function BengkelLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-circle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="layanan" options={{ href: null }} />
      <Tabs.Screen name="order-detail" options={{ href: null }} />
      <Tabs.Screen name="montir" options={{ href: null }} />
      <Tabs.Screen name="setup-bengkel" options={{ href: null }} />
      <Tabs.Screen name="update-profile" options={{ href: null }} />
      <Tabs.Screen name="change-password" options={{ href: null }} />
      <Tabs.Screen name="pilih-lokasi" options={{ href: null }} />
    </Tabs>
  );
}
