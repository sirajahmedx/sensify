// Start of Selection
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Accelerometer } from "expo-sensors";
import { Ionicons } from "@expo/vector-icons";

const DAILY_GOAL = 30;
const DISTANCE_THRESHOLD = 0.5;
const COOLDOWN_TIME = 500; // in milliseconds

const StepCounter = () => {
   const [steps, setSteps] = useState(0);
   const [goalReached, setGoalReached] = useState(false);
   const [lastStepTime, setLastStepTime] = useState<number>(0);
   const [lastPosition, setLastPosition] = useState<{
      x: number;
      y: number;
      z: number;
   } | null>(null);
   const [isMoving, setIsMoving] = useState(false);
   const [movementBuffer, setMovementBuffer] = useState<number[]>([]);

   useEffect(() => {
      Accelerometer.setUpdateInterval(100);

      const subscription = Accelerometer.addListener((accelerometerData) => {
         const { x, y, z } = accelerometerData;

         if (lastPosition) {
            const movementDistance = Math.sqrt(
               Math.pow(lastPosition.x - x, 2) +
                  Math.pow(lastPosition.y - y, 2) +
                  Math.pow(lastPosition.z - z, 2)
            );

            // Add current movement to buffer
            const newBuffer = [...movementBuffer, movementDistance].slice(-10);
            setMovementBuffer(newBuffer);

            // Calculate average movement
            const avgMovement =
               newBuffer.reduce((a, b) => a + b, 0) / newBuffer.length;
            setIsMoving(avgMovement > 0.1);

            if (avgMovement > 0.1) {
               detectStep(movementDistance);
            }
         }

         setLastPosition({ x, y, z });
      });

      return () => subscription.remove();
   }, [lastPosition, movementBuffer]);

   const detectStep = useCallback(
      (movementDistance: number) => {
         const currentTime = Date.now();

         if (
            movementDistance > DISTANCE_THRESHOLD &&
            currentTime - lastStepTime > COOLDOWN_TIME
         ) {
            setSteps((prevSteps) => {
               const newStepCount = prevSteps + 1;
               if (newStepCount >= DAILY_GOAL) setGoalReached(true);
               return newStepCount;
            });

            setLastStepTime(currentTime);
         }
      },
      [lastStepTime]
   );

   const resetSteps = () => {
      setSteps(0);
      setGoalReached(false);
      setLastStepTime(0);
      setLastPosition(null);
      setMovementBuffer([]);
      setIsMoving(false);
   };

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Step Counter</Text>
         <View style={styles.stepInfo}>
            <Ionicons name="footsteps" size={30} color="#4F46E5" />
            <Text style={styles.stepCount}>Steps: {steps}</Text>
         </View>
         <Text style={styles.goalText}>
            Goal: {DAILY_GOAL} steps{" "}
            {goalReached && <Ionicons name="medal" size={30} color="gold" />}
         </Text>
         {goalReached && (
            <Text style={styles.badge}>🏅 Daily Challenge Complete!</Text>
         )}
         <TouchableOpacity style={styles.resetButton} onPress={resetSteps}>
            <Text style={styles.resetButtonText}>Reset</Text>
         </TouchableOpacity>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: "#F3F4F6",
   },
   title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#1F2937",
   },
   stepInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 10,
   },
   stepCount: {
      fontSize: 22,
      marginLeft: 10,
      color: "#4B5563",
   },
   goalText: {
      fontSize: 18,
      marginVertical: 5,
      color: "#6B7280",
   },
   badge: {
      fontSize: 22,
      color: "green",
      marginVertical: 10,
   },
   resetButton: {
      marginTop: 20,
      backgroundColor: "#228be6",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
   },
   resetButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
   },
});

export default StepCounter;
