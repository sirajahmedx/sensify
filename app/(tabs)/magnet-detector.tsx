import React, { useState, useEffect } from "react";
import {
   StyleSheet,
   View,
   Text,
   Animated,
   Vibration,
   Dimensions,
   SafeAreaView,
} from "react-native";
import { Magnetometer } from "expo-sensors";
import { MagnetometerMeasurement } from "expo-sensors";
import { Audio } from "expo-av";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function MagnetDetector() {
   const [data, setData] = useState<MagnetometerMeasurement>({
      x: 0,
      y: 0,
      z: 0,
      timestamp: 0,
   });
   const [magnetPresent, setMagnetPresent] = useState(false);
   const [sound, setSound] = useState<Audio.Sound | null>(null);
   const [subscription, setSubscription] = useState(null);
   const [isAvailable, setIsAvailable] = useState(true);

   // Animation values
   const pulseAnim = new Animated.Value(1);
   const strengthAnim = new Animated.Value(0);

   // Calculate magnetic field strength
   const magneticStrength = Math.sqrt(
      Math.pow(data.x, 2) + Math.pow(data.y, 2) + Math.pow(data.z, 2)
   );

   const normalizedStrength = Math.min(
      Math.floor((magneticStrength / 200) * 100),
      100
   );

   useEffect(() => {
      checkAvailability();
      setupSound();

      return () => {
         cleanup();
      };
   }, []);

   useEffect(() => {
      if (magnetPresent) {
         startPulseAnimation();
         playDetectionEffects();
      } else {
         stopPulseAnimation();
      }
   }, [magnetPresent]);

   const checkAvailability = async () => {
      const available = await Magnetometer.isAvailableAsync();
      setIsAvailable(available);
      if (available) {
         startMagnetometer();
      }
   };

   const setupSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
         require("../../assets/alert.mp3"),
         { shouldPlay: false }
      );
      setSound(sound);
   };

   const startMagnetometer = () => {
      Magnetometer.setUpdateInterval(100);
      const subscription = Magnetometer.addListener((result) => {
         setData(result);
         const magnitude = Math.sqrt(
            Math.pow(result.x, 2) +
               Math.pow(result.y, 2) +
               Math.pow(result.z, 2)
         );
         setMagnetPresent(magnitude > 100);
      });
      setSubscription(subscription);
   };

   const cleanup = () => {
      subscription?.remove();
      sound?.unloadAsync();
   };

   const startPulseAnimation = () => {
      Animated.loop(
         Animated.sequence([
            Animated.timing(pulseAnim, {
               toValue: 1.3,
               duration: 800,
               useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
               toValue: 1,
               duration: 800,
               useNativeDriver: true,
            }),
         ])
      ).start();
   };

   const stopPulseAnimation = () => {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
   };

   const playDetectionEffects = async () => {
      Vibration.vibrate([200, 100, 200]);
      try {
         await sound?.setPositionAsync(0);
         await sound?.playAsync();
      } catch (error) {
         console.log("Error playing sound:", error);
      }
   };

   if (!isAvailable) {
      return (
         <SafeAreaView style={styles.container}>
            <LinearGradient
               colors={["#ff6b6b", "#f03e3e"]}
               style={styles.errorCard}
            >
               <Ionicons name="warning" size={80} color="#fff" />
               <Text style={styles.errorText}>
                  Magnetometer is not available on this device
               </Text>
            </LinearGradient>
         </SafeAreaView>
      );
   }

   return (
      <SafeAreaView style={styles.container}>
         <StatusBar style="auto" />
         <LinearGradient 
            colors={["#ffffff", "#f8f9fa"]} 
            style={styles.card}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
         >
            <Text style={styles.title}>Magnet Detector</Text>

            <Animated.View
               style={[
                  styles.iconContainer,
                  { transform: [{ scale: pulseAnim }] },
               ]}
            >
               <LinearGradient
                  colors={
                     magnetPresent
                        ? ["#4dabf7", "#228be6"]
                        : ["#adb5bd", "#868e96"]
                  }
                  style={styles.iconGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
               >
                  <Ionicons
                     name={magnetPresent ? "magnet" : "magnet-outline"}
                     size={80}
                     color="#fff"
                  />
               </LinearGradient>
               {magnetPresent && (
                  <Animated.View
                     style={[styles.pulseCircle, { opacity: pulseAnim }]}
                  />
               )}
            </Animated.View>

            <View style={styles.strengthContainer}>
               <Text style={styles.strengthText}>
                  Magnetic Field Strength: {normalizedStrength}%
               </Text>
               <View style={styles.progressBarContainer}>
                  <LinearGradient
                     colors={["#4dabf7", "#228be6"]}
                     start={{ x: 0, y: 0 }}
                     end={{ x: 1, y: 0 }}
                     style={[
                        styles.progressFill,
                        { width: `${normalizedStrength}%` },
                     ]}
                  />
               </View>
            </View>

            <Text
               style={[
                  styles.status,
                  { color: magnetPresent ? "#228be6" : "#868e96" },
               ]}
            >
               {magnetPresent ? "Magnet Detected!" : "No Magnet Detected"}
            </Text>

            <Text style={styles.instruction}>
               {magnetPresent
                  ? "Move the magnet away to stop detection"
                  : "Bring a magnet closer to detect"}
            </Text>

            <View style={styles.debugContainer}>
               <Text style={styles.debugText}>X: {data.x.toFixed(2)}</Text>
               <Text style={styles.debugText}>Y: {data.y.toFixed(2)}</Text>
               <Text style={styles.debugText}>Z: {data.z.toFixed(2)}</Text>
            </View>
         </LinearGradient>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
      padding: 20,
   },
   card: {
      flex: 1,
      borderRadius: 24,
      padding: 24,
      width: "100%",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
   },
   title: {
      fontSize: 32,
      fontWeight: "800",
      marginBottom: 32,
      color: "#1a1a1a",
      letterSpacing: 0.5,
   },
   iconContainer: {
      width: 160,
      height: 160,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 32,
   },
   iconGradient: {
      width: 140,
      height: 140,
      borderRadius: 70,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
   },
   pulseCircle: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: "rgba(77, 171, 247, 0.2)",
   },
   strengthContainer: {
      width: "100%",
      marginVertical: 32,
   },
   strengthText: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 16,
      color: "#495057",
   },
   progressBarContainer: {
      width: "100%",
      height: 16,
      backgroundColor: "#e9ecef",
      borderRadius: 8,
      overflow: "hidden",
   },
   progressFill: {
      height: "100%",
   },
   status: {
      fontSize: 28,
      fontWeight: "700",
      marginVertical: 20,
      letterSpacing: 0.5,
   },
   instruction: {
      fontSize: 18,
      color: "#495057",
      textAlign: "center",
      lineHeight: 26,
   },
   debugContainer: {
      marginTop: 32,
      padding: 20,
      backgroundColor: "#f1f3f5",
      borderRadius: 16,
      width: "100%",
   },
   debugText: {
      fontSize: 16,
      color: "#495057",
      fontFamily: "monospace",
      marginVertical: 4,
   },
   errorCard: {
      flex: 1,
      padding: 32,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
   },
   errorText: {
      marginTop: 24,
      fontSize: 20,
      fontWeight: "600",
      color: "#fff",
      textAlign: "center",
      lineHeight: 28,
   },
});
