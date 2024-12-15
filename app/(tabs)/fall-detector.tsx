import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import * as Sensors from "expo-sensors";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Type Definitions
interface SensorData {
  x: number;
  y: number;
  z: number;
}

type ScreenType = "home" | "settings";

const FallDetectionApp: React.FC = () => {
  // State Management
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [emergencyContact, setEmergencyContact] = useState<string>("");
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("home");
  const [isSensorAvailable, setIsSensorAvailable] = useState<boolean>(true);

  useEffect(() => {
    // Check if the magnetometer is available on the device
    const checkMagnetometerAvailability = async () => {
      try {
        const isAvailable = await Sensors.Accelerometer.isAvailableAsync();
        setIsSensorAvailable(isAvailable);
      } catch (error) {
        console.error("Error checking magnetometer availability:", error);
        setIsSensorAvailable(false);
      }
    };

    checkMagnetometerAvailability();
  }, []);

  useEffect(() => {
    if (!setIsSensorAvailable) {
      Alert.alert(
        "Oops! No Accelometer Found",
        "Oh no! It seems like your device doesn't have an accelerometer.. 😞 Please try again with a device that has it! 💔 We're really sorry! 😓",
      );
    }
  }, []);

  const [sensorData, setSensorData] = useState<{
    acceleration: number;
    orientation: number;
  }>({
    acceleration: 0,
    orientation: 0,
  });

  // Constant Configurations
  const FALL_THRESHOLD = 2.5; // m/s^2
  const RESPONSE_TIMEOUT = 20000; // 30 seconds

  // Permission Setup
  useEffect(() => {
    const setupPermissions = async () => {
      try {
        // Location Permissions
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== "granted") {
          Alert.alert("Permission needed", "Location permission is required");
          return;
        }

        // Notification Permissions
        const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
        if (notificationStatus !== "granted") {
          Alert.alert("Permission needed", "Notification permission is required");
          return;
        }

        // Load saved emergency contact
        const savedContact = await AsyncStorage.getItem("emergencyContact");
        if (savedContact) {
          setEmergencyContact(savedContact);
        }
      } catch (error) {
        console.error("Permission setup error:", error);
        Alert.alert("Error", "Could not set up permissions");
      }
    };

    setupPermissions();
  }, []);

  // Send Emergency Alert
  const sendEmergencyAlert = useCallback(async () => {
    try {
      // Get current location
      const { coords } = await Location.getCurrentPositionAsync({});

      // Construct emergency message
      const locationMessage = `Location: https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;

      // Send notification
      await Notifications.presentNotificationAsync({
        title: "Emergency Alert Sent",
        body: "Emergency contact has been notified",
        data: { type: "emergency_alert" },
      });

      // Log for location (in place of SMS)
      console.log(locationMessage);
    } catch (error) {
      console.error("Emergency alert error:", error);
      Alert.alert("Error", "Could not send emergency alert");
    }
  }, []);

  // Start Fall Detection
  const startFallDetection = useCallback(async () => {
    try {
      // Subscribe to accelerometer
      const accelerometerSubscription = Sensors.Accelerometer.addListener(
        ({ x, y, z }: SensorData) => {
          const acceleration = Math.sqrt(x * x + y * y + z * z);

          setSensorData((prev) => ({
            ...prev,
            acceleration,
          }));

          // Fall detection logic
          if (acceleration > FALL_THRESHOLD) {
            handlePotentialFall();
          }
        },
      );

      // Subscribe to gyroscope
      const gyroscopeSubscription = Sensors.Gyroscope.addListener(({ x, y, z }: SensorData) => {
        const orientation = Math.sqrt(x * x + y * y + z * z);

        setSensorData((prev) => ({
          ...prev,
          orientation,
        }));
      });

      // Start sensors
      await Sensors.Accelerometer.setUpdateInterval(100);
      await Sensors.Gyroscope.setUpdateInterval(100);

      setIsMonitoring(true);

      // Return cleanup function
      return () => {
        accelerometerSubscription.remove();
        gyroscopeSubscription.remove();
      };
    } catch (error) {
      console.error("Start fall detection error:", error);
      Alert.alert("Error", "Could not start fall detection");
    }
  }, []);

  // Handle Potential Fall
  const handlePotentialFall = useCallback(async () => {
    try {
      // Send initial notification
      await Notifications.presentNotificationAsync({
        title: "Potential Fall Detected",
        body: "Are you okay? Tap to confirm you are safe. Emergency contact will be notified in 20 seconds.",
        data: { type: "fall_alert" },
      });

      // Simulate emergency alert countdown
      const timeoutId = setTimeout(async () => {
        await sendEmergencyAlert();
      }, RESPONSE_TIMEOUT);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error("Fall detection error:", error);
    }
  }, [sendEmergencyAlert]);

  // Save Emergency Contact
  const saveEmergencyContact = useCallback(async () => {
    // Basic phone number validation
    const cleanedNumber = emergencyContact.replace(/[^\d]/g, "");

    if (cleanedNumber.length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid phone number");
      return;
    }

    try {
      await AsyncStorage.setItem("emergencyContact", cleanedNumber);
      Alert.alert("Success", "Emergency contact saved");
      setCurrentScreen("home");
    } catch (error) {
      console.error("Save contact error:", error);
      Alert.alert("Error", "Could not save emergency contact");
    }
  }, [emergencyContact]);

  // Stop Fall Detection
  const stopFallDetection = useCallback(() => {
    // Remove all sensor listeners
    Sensors.Accelerometer.removeAllListeners();
    Sensors.Gyroscope.removeAllListeners();

    setIsMonitoring(false);
  }, []);

  // Render Home Screen
  const renderHomeScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Fall Detection App</Text>

      {/* Emergency Contact Display */}

      {/* Monitoring Controls */}
      <View style={styles.buttonContainer}>
        {!isMonitoring ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={startFallDetection}
          >
            <Text style={styles.buttonText}>Start Monitoring</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopFallDetection}>
            <Text style={styles.buttonText}>Stop Monitoring</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Manual Emergency Alert */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.alertButton]} onPress={sendEmergencyAlert}>
          <Text style={styles.buttonText}>Manual Emergency Alert</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contactDisplay}>
        <Text style={styles.contactText}>Emergency Contact: {emergencyContact || "Not Set"}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setCurrentScreen("settings")}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Settings Screen
  const renderSettingsScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Emergency Contact Number"
        value={emergencyContact}
        onChangeText={setEmergencyContact}
        keyboardType="phone-pad"
        maxLength={15}
      />
      <Text style={styles.helpText}>Enter a 10-digit phone number (e.g., 1234567890)</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={saveEmergencyContact}
        >
          <Text style={styles.buttonText}>Save Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => setCurrentScreen("home")}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main Render
  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === "home" ? renderHomeScreen() : renderSettingsScreen()}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 45,
    width: "100%",
    borderColor: "#BDBDBD",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#FFF",
    fontSize: 16,
  },
  helpText: {
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  contactDisplay: {
    marginBottom: 20,
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    backgroundColor: "#2196F3",
    borderRadius: 10,
    marginHorizontal: 10,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    width: "80%",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#F44336",
  },
  alertButton: {
    backgroundColor: "#2196F3",
  },
  backButton: {
    backgroundColor: "#9E9E9E",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default FallDetectionApp;
