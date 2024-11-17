import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
   return (
      <Tabs
         screenOptions={{
            tabBarActiveTintColor: "#228be6",
            tabBarInactiveTintColor: "#242729",
            headerShown: false,
            tabBarStyle: {
               borderTopWidth: 0,
               height: 70,
               backgroundColor: "#FFFFFF",
               position: "absolute",
               bottom: 0,
               left: 0,
               right: 0,
               elevation: 5,
               borderTopLeftRadius: 20,
               borderTopRightRadius: 20,
               paddingHorizontal: 10,
               paddingBottom: 5,
               borderTopColor: "#E0E0E0",
            },
            tabBarShowLabel: true,
            tabBarItemStyle: {
               marginHorizontal: 5,
               borderRadius: 10,
               marginBottom: 10,
               paddingVertical: 8,
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
            name="ball-game"
            options={{
               title: "Ball Game",
               tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                     name={focused ? "stop-circle" : "stop-circle-outline"}
                     size={28}
                     color={color}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="tilt-game"
            options={{
               title: "Surface",
               tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                     name={focused ? "arrow-redo" : "arrow-redo-outline"}
                     size={28}
                     color={color}
                  />
               ),
            }}
         />
      </Tabs>
   );
}
