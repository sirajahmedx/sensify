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
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { Asset } from "expo-asset";

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
                     <Ionicons name="sunny" size={32} color="#ffd43b" />
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
                     <Ionicons name="magnet" size={32} color="#ff6b6b" />
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
                     <Ionicons name="stop-circle" size={32} color="#4dabf7" />
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
                     <Ionicons name="arrow-redo" size={32} color="#4dabf7" />
                     <Text style={styles.cardTitle}>
                        Surface Level Detector
                     </Text>
                     <Text style={styles.cardDescription}>
                        Use your device's tilt sensors to level surfaces
                        accurately.
                     </Text>
                     <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => router.push("/(tabs)/tilt-game")}
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

function circle() {
   return (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         width="24"
         height="24"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2"
         stroke-linecap="round"
         stroke-linejoin="round"
         className="lucide lucide-circle"
      >
         <circle cx="12" cy="12" r="10" />
      </svg>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
      backgroundColor: "#ffffff",
      paddingTop: 50,
   },
   container: {
      flex: 1,
      backgroundColor: "#ffffff",
   },
   contentContainer: {
      padding: 20,
      paddingBottom: 100,
   },
   titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
      gap: 12,
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   creatorContainer: {
      alignItems: "center",
      marginBottom: 32,
   },
   creatorText: {
      fontSize: 16,
      color: "#666",
      fontStyle: "italic",
   },
   creatorName: {
      fontSize: 14,
      color: "#666",
      marginTop: 4,
   },
   subText: {
      fontSize: 14,
      color: "#888",
      marginTop: 4,
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#212529",
   },
   cardsContainer: {
      gap: 20,
   },
   card: {
      backgroundColor: "#F7F7F7",
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
      color: "#343a40",
      marginTop: 12,
      marginBottom: 8,
   },
   cardDescription: {
      textAlign: "center",
      color: "#495057",
      marginBottom: 12,
   },
   cardFeatures: {
      color: "#666",
      fontSize: 14,
      marginBottom: 16,
      alignSelf: "flex-start",
   },
   viewButton: {
      backgroundColor: "#228be6",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      width: "100%",
   },
   viewButtonText: {
      color: "#ffffff",
      fontWeight: "600",
      textAlign: "center",
   },
});
