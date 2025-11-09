/**
 * Layout untuk Role: Pelanggan
 */

import { Tabs } from "expo-router";
import { Colors } from "../../src/constants/colors";

export default function PelangganLayout() {
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
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
        }}
      />
    </Tabs>
  );
}
