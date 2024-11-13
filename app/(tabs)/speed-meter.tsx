// Start of Selection
import React, { useState, useEffect, useRef } from "react";
import {
   View,
   Text,
   StyleSheet,
   Switch,
   TouchableOpacity,
   ActivityIndicator,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import { Ionicons } from "@expo/vector-icons";

const SpeedometerApp = () => {
   const [speed, setSpeed] = useState(0);
   const [units, setUnits] = useState("km/h");
   const [mode, setMode] = useState("driving");
   const [alerts, setAlerts] = useState(false);
   const [isSensorAvailable, setIsSensorAvailable] = useState(true);
   const [isLoading, setIsLoading] = useState(true);

   const lastTimestampRef = useRef<number | null>(null);
   const speedRef = useRef<number>(0);
   const lastAccelerationRef = useRef<number>(0);
   const modeRef = useRef<string>(mode);
   const unitsRef = useRef<string>(units);

   useEffect(() => {
      modeRef.current = mode;
   }, [mode]);

   useEffect(() => {
      unitsRef.current = units;
   }, [units]);

   useEffect(() => {
      let subscription: any;

      const startAccelerometer = async () => {
         try {
            const isAvailable = await Accelerometer.isAvailableAsync();
            setIsSensorAvailable(isAvailable);
            if (!isAvailable) {
               console.error("Accelerometer is not available on this device.");
               setIsLoading(false);
               return;
            }
            Accelerometer.setUpdateInterval(100);

            subscription = Accelerometer.addListener((accelerometerData) => {
               const { x, y, z } = accelerometerData;
               const currentTimestamp = Date.now();

               if (lastTimestampRef.current) {
                  const deltaTime =
                     (currentTimestamp - lastTimestampRef.current) / 1000;
                  if (deltaTime > 0) {
                     const currentSpeed = calculateSpeed(x, y, z, deltaTime);
                     // Apply exponential smoothing
                     const smoothedSpeed =
                        0.7 * speedRef.current + 0.3 * currentSpeed;
                     setSpeed(smoothedSpeed);
                     speedRef.current = smoothedSpeed;
                  }
               }

               lastTimestampRef.current = currentTimestamp;
            });
            setIsLoading(false);
         } catch (error) {
            console.error("Error setting up accelerometer:", error);
            setIsSensorAvailable(false);
            setIsLoading(false);
         }
      };

      startAccelerometer();

      return () => {
         if (subscription) {
            subscription.remove();
         }
      };
   }, []);

   const calculateSpeed = (
      x: number,
      y: number,
      z: number,
      deltaTime: number
   ) => {
      // Calculate the magnitude of the acceleration vector
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
      // Subtract gravity to get net acceleration
      const netAcceleration = totalAcceleration - 9.81;

      // Threshold to reduce noise
      const accelerationThreshold = 0.1;
      if (
         Math.abs(netAcceleration - lastAccelerationRef.current) <
         accelerationThreshold
      ) {
         return speedRef.current;
      }

      lastAccelerationRef.current = netAcceleration;

      // Determine sensitivity based on mode
      let sensitivity = 0.1;
      switch (modeRef.current) {
         case "walking":
            sensitivity = 0.05;
            break;
         case "cycling":
            sensitivity = 0.08;
            break;
         case "driving":
            sensitivity = 0.2;
            break;
         default:
            sensitivity = 0.1;
      }

      // Calculate speed change
      const speedChange = netAcceleration * sensitivity * deltaTime;
      let newSpeed = speedRef.current + speedChange;

      // Apply speed limits based on mode
      const speedLimits: Record<string, number> = {
         walking: 10,
         cycling: 40,
         driving: 200,
      };
      newSpeed = Math.max(0, Math.min(newSpeed, speedLimits[modeRef.current]));

      // Convert to mph if needed
      if (unitsRef.current === "mph") {
         newSpeed *= 0.621371;
      }

      return newSpeed;
   };

   const toggleUnits = () => {
      setUnits((prevUnits) => (prevUnits === "km/h" ? "mph" : "km/h"));
      setSpeed(0);
      speedRef.current = 0;
      lastTimestampRef.current = null;
      lastAccelerationRef.current = 0;
   };

   const toggleMode = () => {
      setMode((prevMode) =>
         prevMode === "walking"
            ? "cycling"
            : prevMode === "cycling"
            ? "driving"
            : "walking"
      );
      setSpeed(0);
      speedRef.current = 0;
      lastTimestampRef.current = null;
      lastAccelerationRef.current = 0;
   };

   const toggleAlerts = () => {
      setAlerts((prevAlerts) => !prevAlerts);
   };

   return (
      <View style={styles.container}>
         {isLoading ? (
            <ActivityIndicator size="large" color="#4F46E5" />
         ) : isSensorAvailable ? (
            <>
               <View style={styles.speedContainer}>
                  <View style={styles.speedometer}>
                     <View
                        style={[
                           styles.speedIndicator,
                           {
                              height: Math.min(
                                 (speed / (units === "km/h" ? 200 : 124)) * 200,
                                 200
                              ),
                           },
                        ]}
                     />
                  </View>
                  <Text style={styles.speedText}>{speed.toFixed(1)}</Text>
                  <Text style={styles.unitsText}>{units}</Text>
                  <Text style={styles.modeText}>{`Mode: ${mode}`}</Text>
               </View>
               <View style={styles.settingsContainer}>
                  <View style={styles.settingsRow}>
                     <Text style={styles.labelText}>Units</Text>
                     <Switch
                        value={units === "mph"}
                        onValueChange={toggleUnits}
                     />
                  </View>
                  <View style={styles.settingsRow}>
                     <Text style={styles.labelText}>Mode</Text>
                     <Switch
                        value={mode === "driving"}
                        onValueChange={toggleMode}
                     />
                  </View>
                  <View style={styles.settingsRow}>
                     <Text style={styles.labelText}>Alerts</Text>
                     <Switch value={alerts} onValueChange={toggleAlerts} />
                  </View>
               </View>
               <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                     setSpeed(0);
                     speedRef.current = 0;
                     lastTimestampRef.current = null;
                     lastAccelerationRef.current = 0;
                  }}
               >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.resetButtonText}>Reset Speed</Text>
               </TouchableOpacity>
            </>
         ) : (
            <View style={styles.errorContainer}>
               <Ionicons name="alert-circle" size={50} color="#ff3b30" />
               <Text style={styles.errorText}>
                  Accelerometer is not available on this device.
               </Text>
            </View>
         )}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#F3F4F6",
      padding: 20,
      justifyContent: "center",
      alignItems: "center",
   },
   speedContainer: {
      alignItems: "center",
      marginBottom: 20,
   },
   speedometer: {
      width: 50,
      height: 200,
      backgroundColor: "#e0e0e0",
      borderRadius: 10,
      justifyContent: "flex-end",
      alignItems: "center",
      overflow: "hidden",
   },
   speedIndicator: {
      width: "100%",
      backgroundColor: "#4F46E5",
      position: "absolute",
      bottom: 0,
      borderRadius: 10,
   },
   speedText: {
      fontSize: 48,
      fontWeight: "bold",
      color: "#1F2937",
   },
   unitsText: {
      fontSize: 24,
      color: "#6B7280",
   },
   modeText: {
      fontSize: 16,
      color: "#6B7280",
      marginTop: 8,
   },
   settingsContainer: {
      marginBottom: 20,
      width: "100%",
   },
   settingsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
   },
   labelText: {
      fontSize: 18,
      color: "#1F2937",
   },
   resetButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#4F46E5",
      padding: 16,
      borderRadius: 12,
      width: "60%",
   },
   resetButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
   },
   errorContainer: {
      justifyContent: "center",
      alignItems: "center",
   },
   errorText: {
      fontSize: 18,
      color: "#ff3b30",
      textAlign: "center",
      marginTop: 10,
   },
});

export default SpeedometerApp;
