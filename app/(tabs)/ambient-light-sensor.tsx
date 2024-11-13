import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { LightSensor } from "expo-sensors";

const LIGHT_STATES = {
   PITCH_BLACK: { threshold: 0, message: "Completely Dark", color: "#000000" },
   VERY_DARK: { threshold: 5, message: "Very Dim", color: "#0d0d0d" },
   DARK: { threshold: 20, message: "Dim", color: "#1a1a1a" },
   DIM: { threshold: 50, message: "Low Light", color: "#4a4a4a" },
   MODERATE: { threshold: 100, message: "Moderate Light", color: "#787878" },
   BRIGHT: { threshold: 500, message: "Bright Light", color: "#a8a8a8" },
   VERY_BRIGHT: {
      threshold: 1000,
      message: "Very Bright Light",
      color: "#d3d3d3",
   },
   INTENSE: { threshold: 5000, message: "Intense Light", color: "#f5f5f5" },
   EXTREME: {
      threshold: 10000,
      message: "Extremely Bright Light",
      color: "#ffffff",
   },
};

const AmbientLightSensor: React.FC = () => {
   const [lightLevel, setLightLevel] = useState<number>(0);
   const [colorAnim] = useState<Animated.Value>(() => new Animated.Value(0));
   const [currentState, setCurrentState] = useState(LIGHT_STATES.PITCH_BLACK);

   const getLightState = useCallback((illuminance: number) => {
      for (const state of Object.values(LIGHT_STATES)) {
         if (illuminance <= state.threshold) return state;
      }
      return LIGHT_STATES.EXTREME;
   }, []);

   useEffect(() => {
      let subscription: { remove: () => void };
      let mounted = true;

      const initSensor = async () => {
         try {
            const isAvailable = await LightSensor.isAvailableAsync();
            if (!isAvailable || !mounted) return;

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
                  Animated.timing(colorAnim, {
                     toValue: Object.values(LIGHT_STATES).indexOf(newState),
                     duration: 100, // Faster animation
                     useNativeDriver: false,
                  }).start();
               }
            });
         } catch (error) {
            console.error("Failed to initialize light sensor:", error);
         }
      };

      initSensor();

      return () => {
         mounted = false;
         subscription?.remove();
      };
   }, [currentState, colorAnim, getLightState]);

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

   return (
      <Animated.View
         style={[styles.container, { backgroundColor: interpolatedColor }]}
      >
         <View style={styles.contentContainer}>
            <Text style={[styles.messageText, { color: textColor }]}>
               {currentState.message}
            </Text>
            <Text style={[styles.lightLevelText, { color: textColor }]}>
               Light Level: {lightLevel.toFixed(1)} lx
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
   contentContainer: {
      padding: 20,
      borderRadius: 15,
      alignItems: "center",
   },
   messageText: {
      fontSize: 32,
      fontWeight: "900",
      marginBottom: 20,
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
   },
   lightLevelText: {
      fontSize: 20,
      fontWeight: "600",
   },
});

export default AmbientLightSensor;
