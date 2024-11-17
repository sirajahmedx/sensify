import {
   StyleSheet,
   View,
   ScrollView,
   Text,
   SafeAreaView,
   TouchableOpacity,
} from "react-native";
import { HelloWave } from "@/components/HelloWave";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons"; // Changed to FontAwesome
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
   return (
      <>
         <StatusBar style="dark" />
         <SafeAreaView style={styles.safeArea}>
            <ScrollView
               style={styles.container}
               showsVerticalScrollIndicator={true}
               contentContainerStyle={styles.contentContainer}
            >
               <View style={styles.titleContainer}>
                  <Text style={styles.title}>Welcome to Sensify!</Text>
                  <HelloWave />
               </View>

               <View style={styles.creatorContainer}>
                  <Text style={styles.subText}>
                     A collection of useful sensor tools for your device
                  </Text>
               </View>

               <View style={styles.cardsContainer}>
                  <View style={styles.card}>
                     <FontAwesome name="sun-o" size={32} color="#FFEB3B" />
                     <Text style={styles.cardTitle}>Ambient Light Sensor</Text>
                     <Text style={styles.cardDescription}>
                        Measure surrounding light levels and get real-time
                        feedback about ambient lighting conditions.
                     </Text>
                     <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() =>
                           router.push("/(tabs)/ambient-light-sensor")
                        }
                     >
                        <Text style={styles.viewButtonText}>View Sensor</Text>
                     </TouchableOpacity>
                  </View>

                  <View style={styles.card}>
                     <FontAwesome name="magnet" size={32} color="#FF6F61" />
                     <Text style={styles.cardTitle}>Magnet Detector</Text>
                     <Text style={styles.cardDescription}>
                        Detect magnetic fields with audio and vibration
                        feedback.
                     </Text>
                     <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => router.push("/(tabs)/magnet-detector")}
                     >
                        <Text style={styles.viewButtonText}>View Sensor</Text>
                     </TouchableOpacity>
                  </View>

                  <View style={styles.card}>
                     <FontAwesome name="futbol-o" size={32} color="#A7FFEB" />
                     <Text style={styles.cardTitle}>Ball Game</Text>
                     <Text style={styles.cardDescription}>
                        Navigate a ball using your device's motion sensors to
                        reach the screen's center.
                     </Text>
                     <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => router.push("/(tabs)/ball-game")}
                     >
                        <Text style={styles.viewButtonText}>View Sensor</Text>
                     </TouchableOpacity>
                  </View>

                  <View style={styles.card}>
                     <FontAwesome name="arrows" size={32} color="#B2DFDB" />
                     <Text style={styles.cardTitle}>
                        Surface Level Detector
                     </Text>
                     <Text style={styles.cardDescription}>
                        Use your device's tilt sensors to level surfaces
                        accurately.
                     </Text>
                     <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() =>
                           router.push("/(tabs)/surface-level-detector")
                        }
                     >
                        <Text style={styles.viewButtonText}>View Sensor</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            </ScrollView>
         </SafeAreaView>
      </>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
      backgroundColor: "#F8F8F8", // Off-white background for safe area
      paddingTop: 50,
   },
   container: {
      flex: 1,
      backgroundColor: "#F8F8F8", // Off-white background for the container
   },
   contentContainer: {
      padding: 20,
      paddingBottom: 100,
   },
   titleContainer: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F8F8F8",
      marginBottom: 10,
   },
   creatorContainer: {
      alignItems: "center",
      marginBottom: 32,
   },
   creatorText: {
      fontSize: 16,
      color: "#333333", // Dark Gray for text
      fontStyle: "italic",
   },
   creatorName: {
      fontSize: 14,
      color: "#333333", // Dark Gray for text
      marginTop: 4,
   },
   subText: {
      fontSize: 16,
      color: "#757575", // Light Gray for text/secondary elements
      marginTop: 4,
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#333333", // Dark Gray for text
   },
   cardsContainer: {
      gap: 20,
   },
   card: {
      backgroundColor: "#FFFFFF", // White background for each card
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
   },
   cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#333333", // Dark Gray for text
      marginTop: 12,
      marginBottom: 8,
   },
   cardDescription: {
      textAlign: "center",
      color: "#757575", // Light Gray for text/secondary elements
      marginBottom: 12,
   },
   cardFeatures: {
      color: "#757575", // Light Gray for text/secondary elements
      fontSize: 14,
      marginBottom: 16,
      alignSelf: "flex-start",
   },
   viewButton: {
      backgroundColor: "#87CEEB", // Soft Sky Blue for View Sensor button
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      width: "100%",
   },
   viewButtonText: {
      color: "#333333", // Dark Gray for text
      fontWeight: "600",
      textAlign: "center",
   },
});
