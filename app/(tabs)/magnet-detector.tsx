import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Vibration,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Magnetometer } from "expo-sensors";
import { MagnetometerMeasurement } from "expo-sensors";
import { Audio } from "expo-av";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "@react-navigation/native";

export default function MagnetDetector() {
  const [data, setData] = useState<MagnetometerMeasurement>({
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  });
  const [magnetPresent, setMagnetPresent] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const pulseAnim = new Animated.Value(1);
  const isFocused = useIsFocused();
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isMagnetometerAvailable, setIsMagnetometerAvailable] = useState(false);

  useEffect(() => {
    // Check if the magnetometer is available on the device
    const checkMagnetometerAvailability = async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();
        setIsMagnetometerAvailable(isAvailable);
      } catch (error) {
        console.error("Error checking magnetometer availability:", error);
        setIsMagnetometerAvailable(false);
      }
    };

    checkMagnetometerAvailability();
  }, []);

  useEffect(() => {
    Alert.alert(
      "Oops! No Magnetometer Found",
      "Oh no! It seems like your device doesn't have an magnetometer. 😞 Please try again with a device that has it! 💔 We're really sorry! 😓",
    );
  }, [isMagnetometerAvailable]);

  const magneticStrength = Math.sqrt(
    Math.pow(data.x, 2) + Math.pow(data.y, 2) + Math.pow(data.z, 2),
  );
  const normalizedStrength = Math.min(Math.floor((magneticStrength / 200) * 100), 100);

  const setupSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require("../../assets/alert.mp3"));
      setSound(sound);
    } catch (error) {
      console.error("Error loading sound:", error);
    }
  };

  const startMagnetometer = () => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener((result) => {
      setData(result);
      const magnitude = Math.sqrt(
        Math.pow(result.x, 2) + Math.pow(result.y, 2) + Math.pow(result.z, 2),
      );
      setMagnetPresent(magnitude > 100);
    });
    setSubscription(sub);
  };

  const stopEverything = () => {
    Vibration.cancel();
    if (subscription) {
      subscription.remove();
    }
    setMagnetPresent(false);
    setIsPlayingSound(false);
  };

  useEffect(() => {
    setupSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      stopEverything();
    };
  }, []);

  const playSound = async () => {
    if (!magnetPresent || !isFocused || isPlayingSound || !sound) return;

    try {
      setIsPlayingSound(true);
      await sound.setPositionAsync(0);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if ("didJustFinish" in status && status.didJustFinish) {
          setIsPlayingSound(false);
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
      setIsPlayingSound(false);
    }
  };

  useEffect(() => {
    if (!isFocused || !isStarted) {
      stopEverything();
      return;
    }

    if (magnetPresent) {
      Vibration.vibrate([0, 500, 500], true);
      playSound();
    } else {
      Vibration.cancel();
    }

    return () => {
      Vibration.cancel();
    };
  }, [magnetPresent, isFocused, isStarted]);

  useEffect(() => {
    if (isStarted) {
      startMagnetometer();
    } else {
      stopEverything();
    }
  }, [isStarted]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <LinearGradient
        colors={magnetPresent ? ["#74c0fc", "#a5d8ff"] : ["#f8f9fa", "#e9ecef"]}
        style={styles.background}
      />
      <View style={styles.card}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons
            name={magnetPresent ? "magnet" : "magnet-outline"}
            size={120}
            color={magnetPresent ? "#1864ab" : "#adb5bd"}
          />
        </Animated.View>
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoText}>
            {magnetPresent ? `Strength: ${normalizedStrength}%` : "No Magnet Detected"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.startButton, isStarted && styles.stopButton]}
        onPress={() => setIsStarted((prev) => !prev)}
      >
        <Text style={styles.startButtonText}>{isStarted ? "Stop" : "Start"}</Text>
      </TouchableOpacity>
      <Text style={styles.warningText}>Please stop the sensor before closing the route.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: 250,
    height: 250,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 125,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  infoButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoText: {
    color: "#495057",
    fontSize: 16,
    fontWeight: "500",
  },
  startButton: {
    marginTop: 40,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: "#74c0fc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stopButton: {
    backgroundColor: "#ff6b6b",
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  warningText: {
    marginTop: 20,
    color: "#d6336c",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
