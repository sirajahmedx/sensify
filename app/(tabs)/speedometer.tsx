// Speedometer.tsx
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import * as Location from "expo-location";

interface Coordinate {
  latitude: number;
  longitude: number;
}

const Speedometer: React.FC = () => {
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [averageSpeed, setAverageSpeed] = useState<number>(0);
  const [unit, setUnit] = useState<"km/h" | "mph">("km/h");
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Unable to access location. Please enable location services.",
        );
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    if (isTracking) {
      const startTracking = async () => {
        const subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1, timeInterval: 500 }, // Fine-tuned interval for better accuracy
          (location) => {
            const { latitude, longitude, speed } = location.coords;
            const newCoordinates: Coordinate[] = [...coordinates, { latitude, longitude }];

            // Calculate distance only if we have at least two coordinates
            if (coordinates.length > 0) {
              const lastCoordinate = coordinates[coordinates.length - 1];
              const distance = haversine(lastCoordinate, { latitude, longitude });
              setTotalDistance((prev) => prev + distance);
            }

            setCoordinates(newCoordinates);
            if (speed !== null) {
              const speedKmh = speed * 3.6; // Convert m/s to km/h
              setCurrentSpeed(smoothSpeed(speedKmh)); // Speedometerly smoothing function
            }
            updateAverageSpeed();
          },
        );

        setLocationSubscription(subscription);
      };

      startTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isTracking]);

  const updateAverageSpeed = () => {
    if (startTime === null) {
      setStartTime(Date.now());
    }

    const elapsedTime = (Date.now() - (startTime || 0)) / 1000; // in seconds
    if (elapsedTime > 0) {
      const avgSpeed = (totalDistance / elapsedTime) * (unit === "km/h" ? 1 : 0.621371);
      setAverageSpeed(avgSpeed);
    }
  };

  const haversine = (coord1: Coordinate, coord2: Coordinate): number => {
    const R = 6371; // Radius of the Earth in km
    const lat1 = coord1.latitude * (Math.PI / 180);
    const lat2 = coord2.latitude * (Math.PI / 180);
    const deltaLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
    const deltaLng = (coord2.longitude - coord1.longitude) * (Math.PI / 180);

    const a =
      Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));

    return R * c; // Distance in km
  };

  const smoothSpeed = (newSpeed: number): number => {
    const smoothingFactor = 0.2; // Adjust this factor to change the smoothing effect
    setCurrentSpeed((prevSpeed) => prevSpeed + smoothingFactor * (newSpeed - prevSpeed));
    return currentSpeed;
  };

  const toggleUnit = () => {
    const newUnit: "km/h" | "mph" = unit === "km/h" ? "mph" : "km/h";
    setUnit(newUnit);
    updateAverageSpeed();
  };

  const handleStart = () => {
    setIsTracking(true);
    setStartTime(null);
    setTotalDistance(0);
    setAverageSpeed(0);
    setCoordinates([]);
  };

  const handleReset = () => {
    setCurrentSpeed(0);
    setTotalDistance(0);
    setAverageSpeed(0);
    setUnit("km/h");
    setCoordinates([]);
    setStartTime(null);
    setIsTracking(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.speed}>{`Current Speed: ${currentSpeed.toFixed(1)} ${unit}`}</Text>
      <Text style={styles.distance}>{`Distance Traveled: ${totalDistance.toFixed(2)} km`}</Text>
      <Text style={styles.average}>{`Average Speed: ${averageSpeed.toFixed(1)} ${unit}`}</Text>
      <Button
        title={isTracking ? "Stop" : "Start"}
        onPress={isTracking ? handleReset : handleStart}
      />
      <Button title={`Switch to ${unit === "km/h" ? "mph" : "km/h"}`} onPress={toggleUnit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  speed: {
    fontSize: 48,
    fontWeight: "bold",
  },
  distance: {
    fontSize: 24,
    marginVertical: 10,
  },
  average: {
    fontSize: 24,
    marginVertical: 10,
  },
});

export default Speedometer;

// Instructions to run the Speedometer:
// 1. Install Expo CLI if you haven't already: npm install -g expo-cli
// 2. Create a new Expo project: expo init speedometer-Speedometer
// 3. Replace the contents of Speedometer.tsx with the code above.
// 4. Install necessary dependencies: expo install expo-location
// 5. Start the project: expo start
