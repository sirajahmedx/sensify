import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#29D45B", // Vibrant Green for active tab
        tabBarInactiveTintColor: "#000000", // Soft Gray for inactive tab
        headerShown: false,

        tabBarShowLabel: false, // Hides labels
        tabBarStyle: {
          borderTopWidth: 0,
          marginHorizontal: "auto",
          height: 60, // Increased height for better spacing
          backgroundColor: "#EBEBEB", // Clean white background
          position: "absolute",
          bottom: 15, // Slightly lifted for a floating effect
          left: 10,
          right: 10,
          borderRadius: 50, // Fully rounded corners
          shadowColor: "#030303",
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: 29, // Subtle shadow for depth
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarItemStyle: {
          marginHorizontal: 0,
          paddingVertical: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ambient-light-sensor"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="weather-sunny" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="magnet-detector"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnet-on" size={30} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ball-game"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="soccer" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="surface-level-detector"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="axis-arrow" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="speedometer"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="speedometer" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
