import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   Switch,
   Vibration,
   Animated,
   Platform,
} from "react-native";
import { Audio } from "expo-av";
import { Magnetometer } from "expo-sensors";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

export default function MagnetDetector() {
   const [magnetData, setMagnetData] = useState<{
      x: number;
      y: number;
      z: number;
   }>({ x: 0, y: 0, z: 0 });
   const [sound, setSound] = useState<any>(null);
   const [isMagnetDetected, setIsMagnetDetected] = useState<boolean>(false);
   const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
   const [isPlaying, setIsPlaying] = useState<boolean>(false);
   const [isSensorAvailable, setIsSensorAvailable] = useState<boolean>(true);
   const isFocused = useIsFocused();

   const scaleAnim = useState(new Animated.Value(1))[0];
   const opacityAnim = useState(new Animated.Value(1))[0];
   const rotateAnim = useState(new Animated.Value(0))[0];

   const MAGNETIC_THRESHOLD = 30;

   const loadSound = async () => {
      try {
         await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
         });
         const { sound } = await Audio.Sound.createAsync(
            require("../../assets/alert.mp3"),
            {
               shouldPlay: false,
               isLooping: true,
               volume: 1.0,
            }
         );
         setSound(sound);
      } catch (error) {
         console.error("Error loading sound:", error);
      }
   };

   const playSound = async () => {
      if (sound && !isPlaying && isFocused) {
         await sound.playAsync();
         setIsPlaying(true);
      }
   };

   const stopSound = async () => {
      if (sound && isPlaying) {
         await sound.stopAsync();
         await sound.setPositionAsync(0);
         setIsPlaying(false);
      }
   };

   const triggerVibration = () => {
      if (vibrationEnabled && Platform.OS !== "web" && isFocused) {
         Vibration.cancel();
         Vibration.vibrate([0, 500, 200, 500]);
      }
   };

   const animateDetection = () => {
      Animated.parallel([
         Animated.sequence([
            Animated.timing(scaleAnim, {
               toValue: 1.2,
               duration: 200,
               useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
               toValue: 1,
               duration: 200,
               useNativeDriver: true,
            }),
         ]),
         Animated.sequence([
            Animated.timing(opacityAnim, {
               toValue: 0.7,
               duration: 100,
               useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
               toValue: 1,
               duration: 100,
               useNativeDriver: true,
            }),
         ]),
         Animated.loop(
            Animated.sequence([
               Animated.timing(rotateAnim, {
                  toValue: 1,
                  duration: 1000,
                  useNativeDriver: true,
               }),
               Animated.timing(rotateAnim, {
                  toValue: 0,
                  duration: 1000,
                  useNativeDriver: true,
               }),
            ])
         ),
      ]).start();
   };

   useEffect(() => {
      const checkSensor = async () => {
         try {
            const isAvailable = await Magnetometer.isAvailableAsync();
            if (isAvailable) {
               await Magnetometer.requestPermissionsAsync();
            }
            setIsSensorAvailable(isAvailable);
         } catch (error) {
            console.error("Error checking sensor:", error);
            setIsSensorAvailable(false);
         }
      };
      checkSensor();
   }, []);

   useEffect(() => {
      if (!isSensorAvailable) return;

      let subscription: any;

      const startMagnetometer = async () => {
         try {
            await Magnetometer.setUpdateInterval(50);

            subscription = Magnetometer.addListener((data) => {
               setMagnetData(data);
               const { x, y, z } = data;
               const magnetStrength = Math.sqrt(
                  Math.abs(x) ** 2 + Math.abs(y) ** 2 + Math.abs(z) ** 2
               );

               if (magnetStrength > MAGNETIC_THRESHOLD) {
                  if (!isMagnetDetected) {
                     setIsMagnetDetected(true);
                     playSound();
                     triggerVibration();
                     animateDetection();
                  }
               } else if (magnetStrength < MAGNETIC_THRESHOLD * 0.8) {
                  if (isMagnetDetected) {
                     setIsMagnetDetected(false);
                     stopSound();
                  }
               }
            });
         } catch (error) {
            console.error("Error setting up magnetometer:", error);
            setIsSensorAvailable(false);
         }
      };

      startMagnetometer();

      return () => {
         if (subscription) {
            subscription.remove();
         }
         stopSound();
      };
   }, [sound, isMagnetDetected, isPlaying, isSensorAvailable]);

   useEffect(() => {
      loadSound();
      return () => {
         if (sound) {
            stopSound();
            sound.unloadAsync();
         }
      };
   }, []);

   const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
   });

   if (!isSensorAvailable) {
      return (
         <View style={styles.container}>
            <Ionicons name="warning" size={64} color="#FF5252" />
            <Text style={[styles.title, { color: "#FF5252" }]}>
               Sensor Not Available
            </Text>
            <Text style={styles.description}>
               This device does not have a magnetometer sensor.
            </Text>
         </View>
      );
   }

   const magnetStrength = Math.sqrt(
      magnetData.x ** 2 + magnetData.y ** 2 + magnetData.z ** 2
   ).toFixed(2);

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Magnet Detector</Text>
         <Text style={styles.description}>
            Move a magnet close to the sensor to trigger a response.
         </Text>

         <Animated.View
            style={[
               styles.indicator,
               isMagnetDetected ? styles.detected : styles.notDetected,
               {
                  transform: [
                     { scale: scaleAnim },
                     { rotate: isMagnetDetected ? spin : "0deg" },
                  ],
                  opacity: opacityAnim,
               },
            ]}
         >
            <Ionicons
               name={isMagnetDetected ? "magnet" : "magnet-outline"}
               size={48}
               color="#fff"
               style={styles.icon}
            />
            <Text style={styles.indicatorText}>
               {isMagnetDetected ? "Magnet Detected!" : "No Magnet Detected"}
            </Text>
            <View style={styles.strengthContainer}>
               <Text style={styles.strengthLabel}>Field Strength:</Text>
               <Text style={styles.strengthValue}>{magnetStrength} µT</Text>
            </View>
         </Animated.View>

         <View style={styles.switchContainer}>
            <Ionicons name="flash" size={24} color="#424242" />
            <Text style={styles.switchLabel}>
               Vibration {vibrationEnabled ? "On" : "Off"}
            </Text>
            <Switch
               value={vibrationEnabled}
               onValueChange={setVibrationEnabled}
               trackColor={{ false: "#767577", true: "#81b0ff" }}
               thumbColor={vibrationEnabled ? "#4CAF50" : "#f4f3f4"}
               ios_backgroundColor="#3e3e3e"
            />
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f0f4f8",
      padding: 20,
      borderRadius: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
   },
   title: {
      fontSize: 36,
      fontWeight: "bold",
      color: "#2E7D32",
      marginBottom: 16,
      textAlign: "center",
   },
   description: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 30,
      color: "#424242",
      opacity: 0.9,
      lineHeight: 24,
      maxWidth: "80%",
   },
   indicator: {
      padding: 20,
      marginBottom: 40,
      borderRadius: 20,
      borderWidth: 4,
      width: "90%",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 10,
   },
   detected: {
      backgroundColor: "#66BB6A",
      borderColor: "#43A047",
   },
   notDetected: {
      backgroundColor: "#EF5350",
      borderColor: "#E53935",
   },
   icon: {
      marginBottom: 10,
   },
   indicatorText: {
      fontSize: 24,
      fontWeight: "600",
      color: "#fff",
      textAlign: "center",
   },
   strengthContainer: {
      marginTop: 10,
      alignItems: "center",
   },
   strengthLabel: {
      fontSize: 14,
      color: "#fff",
   },
   strengthValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#fff",
      marginTop: 5,
   },
   switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      padding: 10,
      borderRadius: 10,
      marginTop: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      gap: 10,
   },
   switchLabel: {
      color: "#424242",
      fontSize: 16,
   },
});
