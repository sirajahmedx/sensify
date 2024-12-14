import { StyleSheet, View, ScrollView, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { HelloWave } from "@/components/HelloWave";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons"; // Changed to FontAwesome
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to Sensify!</Text>
            <HelloWave />
          </View>

          <View style={styles.creatorContainer}>
            <Text style={styles.subText}>A collection of useful sensor tools for your device</Text>
          </View>

          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <FontAwesome name="sun-o" size={32} color="#FFEB3B" />
              <Text style={styles.cardTitle}>Ambient Light Sensor</Text>
              <Text style={styles.cardDescription}>
                Measure surrounding light levels and get real-time feedback about ambient lighting
                conditions.
              </Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => router.push("/(tabs)/ambient-light-sensor")}
              >
                <Text style={styles.viewButtonText}>View Sensor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <FontAwesome name="magnet" size={32} color="#FF6F61" />
              <Text style={styles.cardTitle}>Magnet Detector</Text>
              <Text style={styles.cardDescription}>
                Detect magnetic fields with audio and vibration feedback.
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
                Navigate a ball using your device's motion sensors to reach the screen's center.
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
              <Text style={styles.cardTitle}>Surface Level Detector</Text>
              <Text style={styles.cardDescription}>
                Use your device's tilt sensors to level surfaces accurately.
              </Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => router.push("/(tabs)/surface-level-detector")}
              >
                <Text style={styles.viewButtonText}>View Sensor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White background
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White background for safe area
    paddingTop: 50,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White background for the scroll container
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  titleContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  creatorContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  subText: {
    fontSize: 16,
    color: "#757575", // Light Gray for text
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
    shadowOffset: { width: 8, height: 16 },
    shadowOpacity: 1,
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
    color: "#757575", // Light Gray for text
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: "#87CEEB", // Sky blue for View Sensor button
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
