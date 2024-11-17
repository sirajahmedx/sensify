import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
   return (
      <Tabs
         screenOptions={{
            tabBarActiveTintColor: "#87CEEB", // Soft Sky Blue
            tabBarInactiveTintColor: "#757575", // Light Gray for text/secondary elements
            headerShown: false,
            tabBarStyle: {
               borderTopWidth: 0,
               height: 70,
               backgroundColor: "#F8F8F8", // Off-white
               position: "absolute",
               bottom: 0,
               left: 0,
               right: 0,
               elevation: 5,
               borderTopLeftRadius: 20,
               borderTopRightRadius: 20,
               paddingHorizontal: 10,
               paddingBottom: 5,
               borderTopColor: "#EAEAEA", // Light Gray
            },
            tabBarShowLabel: true, // Add labels
            tabBarItemStyle: {
               marginHorizontal: 5,
               borderRadius: 10,
               marginBottom: 10,
               paddingVertical: 8,
            },
         }}
      >
         <Tabs.Screen
            name="ambient-light-sensor"
            options={{
               title: "Ambient Light",
               tabBarIcon: ({ color }) => (
                  <FontAwesome name="sun-o" size={26} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="magnet-detector"
            options={{
               title: "Magnet Detector",
               tabBarIcon: ({ color }) => (
                  <FontAwesome name="magnet" size={26} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="index"
            options={{
               title: "Home",
               tabBarIcon: ({ color }) => (
                  <FontAwesome name="home" size={30} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="ball-game"
            options={{
               title: "Ball Game",
               tabBarIcon: ({ color }) => (
                  <FontAwesome name="futbol-o" size={26} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="surface-level-detector"
            options={{
               title: "Surface Level",
               tabBarIcon: ({ color }) => (
                  <FontAwesome name="arrows" size={26} color={color} />
               ),
            }}
         />
      </Tabs>
   );
}
