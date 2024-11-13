// Start of Selection
// Start of Selection
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const SPEED_THRESHOLD = 0.5; // m/s, below which speed is considered zero

const Speedometer = () => {
   const [speed, setSpeed] = useState<number | null>(null);
   const [errorMsg, setErrorMsg] = useState<string | null>(null);
   const [isTracking, setIsTracking] = useState<boolean>(false);

   useEffect(() => {
      let subscription: Location.LocationSubscription;

      const startTracking = async () => {
         // Request location permissions
         const { status } = await Location.requestForegroundPermissionsAsync();
         if (status !== Location.PermissionStatus.GRANTED) {
            setErrorMsg("Permission to access location was denied");
            Alert.alert(
               "Permission Denied",
               "Cannot access location to determine speed."
            );
            return;
         }

         // Start location updates with higher frequency
         subscription = await Location.watchPositionAsync(
            {
               accuracy: Location.Accuracy.Highest,
               timeInterval: 100, // Update every 100ms
               distanceInterval: 0.1, // Update every 0.1 meter
            },
            (location) => {
               if (location.coords.speed != null) {
                  if (location.coords.speed < SPEED_THRESHOLD) {
                     setSpeed(0);
                  } else {
                     // Location speed is in m/s, convert to km/h
                     const calculatedSpeed = location.coords.speed * 3.6;
                     setSpeed(calculatedSpeed);
                  }
               } else {
                  setSpeed(0);
               }
            }
         );

         setIsTracking(true);
      };

      startTracking();

      return () => {
         if (subscription) {
            subscription.remove();
         }
         setIsTracking(false);
      };
   }, []);

   let displaySpeed = speed !== null ? speed.toFixed(2) : "--";

   return (
      <View style={styles.container}>
         {speed === null && !errorMsg ? (
            <ActivityIndicator size="large" color="#228be6" />
         ) : (
            <>
               <Ionicons name="speedometer" size={100} color="#228be6" />
               <Text style={styles.speedText}>{displaySpeed} km/h</Text>
               {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            </>
         )}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
   },
   speedText: {
      fontSize: 48,
      fontWeight: "bold",
      marginTop: 20,
      color: "#1F2937",
   },
   errorText: {
      marginTop: 20,
      color: "red",
      fontSize: 16,
      textAlign: "center",
   },
});

export default Speedometer;
