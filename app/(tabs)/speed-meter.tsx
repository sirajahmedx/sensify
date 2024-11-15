import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";

const Speedometer: React.FC = () => {
   const [speed, setSpeed] = useState<number>(0);
   const [hasPermission, setHasPermission] = useState<boolean>(false);

   const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
         setHasPermission(true);
      } else {
         alert("Permission to access location was denied");
      }
   };

   useEffect(() => {
      requestPermission();
   }, []);

   useEffect(() => {
      let locationSubscription: Location.LocationSubscription | null = null;

      const startTracking = async () => {
         try {
            locationSubscription = await Location.watchPositionAsync(
               {
                  accuracy: Location.Accuracy.BestForNavigation,
                  distanceInterval: 0.5, // Reduced distance interval for faster updates
                  timeInterval: 100, // Reduced time interval for faster updates
               },
               (newLocation) => {
                  const { coords } = newLocation;
                  if (coords) {
                     setSpeed(coords.speed ? coords.speed : 0);
                  }
               }
            );
         } catch (error) {
            console.error("Error starting location tracking:", error);
         }
      };

      if (hasPermission) {
         startTracking();
      }

      return () => {
         if (locationSubscription?.remove) {
            locationSubscription.remove();
         }
      };
   }, [hasPermission]);

   const formatSpeed = (speedInMps: number) => {
      const speedInKmh = (speedInMps * 3.6).toFixed(1);
      return `${speedInKmh} km/h`;
   };

   if (!hasPermission) {
      return (
         <View style={styles.container}>
            <Text style={styles.message}>
               Location permission is required to track speed.
            </Text>
         </View>
      );
   }

   return (
      <View style={styles.container}>
         <Text style={styles.speedText}>Speed: {formatSpeed(speed)}</Text>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      padding: 20,
   },
   speedText: {
      fontSize: 48,
      fontWeight: "bold",
      color: "#333",
      marginVertical: 20,
   },
   message: {
      fontSize: 18,
      color: "#d9534f",
      textAlign: "center",
   },
});

export default Speedometer;
