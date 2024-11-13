import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
   View,
   Text,
   StyleSheet,
   Animated,
   Alert,
   Dimensions,
} from "react-native";
import { LightSensor } from "expo-sensors";
import * as Brightness from "expo-brightness";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type IconName = "moon" | "cloudy-night" | "partly-sunny" | "sunny";

const LIGHT_STATES: Record<
   string,
   {
      threshold: number;
      message: string;
      color: string;
      brightness: number;
      icon: IconName;
   }
> = {
   PITCH_BLACK: {
      threshold: 0,
      message: "Completely Dark",
      color: "#000000",
      brightness: 0.2,
      icon: "moon",
   },
   VERY_DARK: {
      threshold: 5,
      message: "Very Dim",
      color: "#0d0d0d",
      brightness: 0.3,
      icon: "cloudy-night",
   },
   DARK: {
      threshold: 20,
      message: "Dim",
      color: "#1a1a1a",
      brightness: 0.4,
      icon: "partly-sunny",
   },
   DIM: {
      threshold: 50,
      message: "Low Light",
      color: "#4a4a4a",
      brightness: 0.5,
      icon: "sunny",
   },
   MODERATE: {
      threshold: 100,
      message: "Moderate Light",
      color: "#787878",
      brightness: 0.6,
      icon: "sunny",
   },
   BRIGHT: {
      threshold: 500,
      message: "Bright Light",
      color: "#a8a8a8",
      brightness: 0.7,
      icon: "sunny",
   },
   VERY_BRIGHT: {
      threshold: 1000,
      message: "Very Bright Light",
      color: "#d3d3d3",
      brightness: 0.8,
      icon: "sunny",
   },
   INTENSE: {
      threshold: 5000,
      message: "Intense Light",
      color: "#f5f5f5",
      brightness: 0.9,
      icon: "sunny",
   },
   EXTREME: {
      threshold: 10000,
      message: "Extremely Bright Light",
      color: "#ffffff",
      brightness: 1.0,
      icon: "sunny",
   },
};

const AmbientLightSensor: React.FC = () => {
   const [lightLevel, setLightLevel] = useState<number>(0);
   const [colorAnim] = useState<Animated.Value>(() => new Animated.Value(0));
   const [currentState, setCurrentState] = useState(LIGHT_STATES.PITCH_BLACK);

   const getLightState = useCallback((illuminance: number) => {
      const states = Object.values(LIGHT_STATES);
      for (let i = 0; i < states.length; i++) {
         if (illuminance <= states[i].threshold) return states[i];
      }
      return LIGHT_STATES.EXTREME;
   }, []);

   useEffect(() => {
      let subscription: { remove: () => void };
      let mounted = true;

      const initSensor = async () => {
         try {
            // Request permission to control brightness
            const { status } = await Brightness.requestPermissionsAsync();
            if (status !== Brightness.PermissionStatus.GRANTED) {
               Alert.alert(
                  "Permission Denied",
                  "Cannot control screen brightness without permission."
               );
               return;
            }

            const isAvailable = await LightSensor.isAvailableAsync();
            if (!isAvailable || !mounted) {
               Alert.alert(
                  "Sensor Unavailable",
                  "Ambient light sensor is not available on this device."
               );
               return;
            }

            LightSensor.setUpdateInterval(100); // Reduced interval for faster updates

            subscription = LightSensor.addListener(({ illuminance }) => {
               if (!mounted) return;

               setLightLevel((prev) => {
                  return Math.abs(prev - illuminance) > 0.5
                     ? illuminance
                     : prev;
               });

               const newState = getLightState(illuminance);
               if (newState !== currentState) {
                  setCurrentState(newState);
               }
            });
         } catch (error) {
            console.error("Failed to initialize light sensor:", error);
            Alert.alert(
               "Initialization Error",
               "An error occurred while initializing the light sensor."
            );
         }
      };

      // Initialize brightness control
      const setInitialBrightness = async () => {
         try {
            const currentBrightness = await Brightness.getBrightnessAsync();
            Animated.timing(colorAnim, {
               toValue: Object.values(LIGHT_STATES).length - 1, // Set to EXTREME by default
               duration: 100,
               useNativeDriver: false,
            }).start();
            Brightness.setBrightnessAsync(currentBrightness);
         } catch (error) {
            console.error("Failed to get initial brightness:", error);
         }
      };

      initSensor();
      setInitialBrightness();

      return () => {
         mounted = false;
         subscription?.remove();
      };
   }, [currentState, colorAnim, getLightState]);

   useEffect(() => {
      const updateBrightness = async () => {
         try {
            await Brightness.setBrightnessAsync(currentState.brightness);
            Animated.timing(colorAnim, {
               toValue: Object.values(LIGHT_STATES).indexOf(currentState),
               duration: 300, // Smoother animation
               useNativeDriver: false,
            }).start();
         } catch (error) {
            console.error("Failed to set brightness:", error);
         }
      };

      updateBrightness();
   }, [currentState, colorAnim]);

   const interpolatedColor = useMemo(() => {
      return colorAnim.interpolate({
         inputRange: Object.values(LIGHT_STATES).map((_, i) => i),
         outputRange: Object.values(LIGHT_STATES).map((state) => state.color),
      });
   }, [colorAnim]);

   const textColor =
      currentState === LIGHT_STATES.INTENSE ||
      currentState === LIGHT_STATES.EXTREME
         ? "#000"
         : "#fff";

   const progress = useMemo(() => {
      // Assuming EXTREME is the max light level
      const maxLight = LIGHT_STATES.EXTREME.threshold;
      return Math.min(lightLevel / maxLight, 1);
   }, [lightLevel]);

   const getIconName = () => {
      return currentState.icon;
   };

   return (
      <Animated.View
         style={[styles.container, { backgroundColor: interpolatedColor }]}
      >
         <View style={styles.card}>
            <Ionicons
               name={getIconName()}
               size={80}
               color={textColor}
               style={styles.icon}
            />
            <Text style={[styles.messageText, { color: textColor }]}>
               {currentState.message}
            </Text>
            <View style={styles.progressContainer}>
               <View style={styles.progressBackground}>
                  <View
                     style={[
                        styles.progressBar,
                        {
                           width: `${progress * 100}%`,
                           backgroundColor: textColor,
                        },
                     ]}
                  />
               </View>
               <Text style={[styles.progressText, { color: textColor }]}>
                  Light Level: {lightLevel.toFixed(1)} lx
               </Text>
            </View>
            <Text style={[styles.brightnessText, { color: textColor }]}>
               Screen Brightness: {(currentState.brightness * 100).toFixed(0)}%
            </Text>
         </View>
      </Animated.View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   card: {
      width: width * 0.85,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 20,
      padding: 30,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
   },
   icon: {
      marginBottom: 20,
   },
   messageText: {
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 15,
      textAlign: "center",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
   },
   progressContainer: {
      width: "100%",
      alignItems: "center",
      marginVertical: 15,
   },
   progressBackground: {
      width: "100%",
      height: 10,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      borderRadius: 5,
      overflow: "hidden",
      marginBottom: 5,
   },
   progressBar: {
      height: "100%",
      borderRadius: 5,
   },
   progressText: {
      fontSize: 16,
      fontWeight: "500",
   },
   brightnessText: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 10,
   },
});

export default AmbientLightSensor;
