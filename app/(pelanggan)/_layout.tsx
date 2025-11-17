/**
 * Layout untuk Role: Pelanggan
 */

import { Tabs } from "expo-router";
import { Colors } from "../../src/constants/colors";
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search-bengkel"
        options={{
          title: "Cari Bengkel",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" size={24} color={color} />
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
      <Tabs.Screen
        name="bengkel-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order-detail"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="update-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
