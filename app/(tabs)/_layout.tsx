import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
   return (
      <Tabs
         screenOptions={{
            tabBarActiveTintColor: "#228be6", // Updated primary color for active items
            tabBarInactiveTintColor: "#242729", // Accent color for inactive items
            headerShown: false,
            tabBarStyle: {
               borderTopWidth: 0,
               height: 70, // Optimized height for touch targets
               backgroundColor: "#FFFFFF", // Clean background color
               position: "absolute",
               bottom: 0,
               left: 0,
               right: 0,
               elevation: 5, // Subtle shadow for depth
               borderTopLeftRadius: 20,
               borderTopRightRadius: 20,
               paddingHorizontal: 10, // Balanced horizontal padding
               paddingBottom: 5, // Consistent bottom padding
               borderTopColor: "#E0E0E0", // Light border color
            },
            tabBarShowLabel: true, // Show labels for clarity
            tabBarItemStyle: {
               // backgroundColor: "#F5F5F5", // Soft background for tab items
               marginHorizontal: 5, // Balanced margin for spacing
               borderRadius: 10,
               marginBottom: 10, // Consistent bottom margin
               paddingVertical: 8, // Adequate vertical padding for touch targets
            },
         }}
      >
         <Tabs.Screen
            name="index"
            options={{
               title: "Home",
               tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                     name={focused ? "home" : "home-outline"}
                     size={28}
                     color={color}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="ambient-light-sensor"
            options={{
               title: "Ambient Light",
               tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                     name={focused ? "sunny" : "sunny-outline"}
                     size={28}
                     color={color}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="magnet-detector"
            options={{
               title: "Magnet Detector",
               tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                     name={focused ? "magnet" : "magnet-outline"}
                     size={28}
                     color={color}
                  />
               ),
            }}
         />

         <Tabs.Screen
            name="speed-meter"
            options={{
               title: "Speed Meter",
               tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                     name={focused ? "speedometer" : "speedometer-outline"}
                     size={28}
                     color={color}
                  />
               ),
            }}
         />
      </Tabs>
   );
}
