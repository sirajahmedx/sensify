import React, { useState, useEffect, useRef, useCallback } from "react";
import {
   StyleSheet,
   View,
   Text,
   Dimensions,
   TouchableOpacity,
   Animated,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const { width, height } = Dimensions.get("window");
const BALL_SIZE = 43;
const CENTER_THRESHOLD = 10;
const WIN_DURATION = 5000;

export default function App() {
   const [position, setPosition] = useState({ x: width / 2, y: height / 2 });
   const [data, setData] = useState({ x: 0, y: 0, z: 0 });
   const [holdStartTime, setHoldStartTime] = useState(null);
   const [hasWon, setHasWon] = useState(false);
   const [holdProgress, setHoldProgress] = useState(0);
   const [winAnimation, setWinAnimation] = useState(new Animated.Value(0));
   const [isActive, setIsActive] = useState(false);
   const holdStartTimeRef = useRef(null);

   useEffect(() => {
      let subscription;

      if (isActive) {
         subscription = Accelerometer.addListener((accelerometerData) => {
            setData(accelerometerData);
         });

         Accelerometer.setUpdateInterval(16);
      }

      return () => subscription?.remove();
   }, [isActive]);

   useEffect(() => {
      if (!isActive || hasWon) return;

      const { x, y } = data;
      setPosition((prev) => ({
         x: Math.max(0, Math.min(width - BALL_SIZE, prev.x - x * 20)),
         y: Math.max(0, Math.min(height - BALL_SIZE, prev.y + y * 20)),
      }));
   }, [data, isActive, hasWon]);

   useEffect(() => {
      if (!isActive || hasWon) return;

      const centerX = width / 2;
      const centerY = height / 2;
      const ballCenterX = position.x;
      const ballCenterY = position.y;

      const distanceFromCenter = Math.sqrt(
         Math.pow(ballCenterX - centerX, 2) + Math.pow(ballCenterY - centerY, 2)
      );

      const isCentered = distanceFromCenter <= CENTER_THRESHOLD;

      if (!hasWon) {
         if (isCentered) {
            if (!holdStartTimeRef.current) {
               holdStartTimeRef.current = Date.now();
            } else {
               const elapsedTime = Date.now() - holdStartTimeRef.current;
               const newProgress = Math.min(
                  (elapsedTime / WIN_DURATION) * 100,
                  100
               );
               setHoldProgress(newProgress);

               if (elapsedTime >= WIN_DURATION) {
                  setHasWon(true);
                  Animated.timing(winAnimation, {
                     toValue: 1,
                     duration: 1000,
                     useNativeDriver: true,
                  }).start();
               }
            }
         } else {
            holdStartTimeRef.current = null;
            setHoldProgress(0);
         }
      }
   }, [position, holdStartTimeRef, hasWon, isActive]);

   const resetGame = useCallback(() => {
      setHasWon(false);
      setHoldProgress(0);
      holdStartTimeRef.current = null;
      setPosition({ x: width / 2, y: height / 2 });
      winAnimation.setValue(0);
   }, [winAnimation]);

   const getProgressMessage = useCallback(() => {
      if (holdProgress === 0) {
         return "Move the ball to the center and hold for 5 seconds!";
      }
      const remainingSeconds = Math.ceil(
         (WIN_DURATION - (WIN_DURATION * holdProgress) / 100) / 1000
      );
      return `Keep holding! ${remainingSeconds} seconds remaining`;
   }, [holdProgress]);

   return (
      <View style={styles.container}>
         <View style={styles.messageContainer}>
            {hasWon ? (
               <Animated.View
                  style={[
                     styles.winTextContainer,
                     {
                        opacity: winAnimation,
                        transform: [
                           {
                              scale: winAnimation.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [1, 1.5],
                              }),
                           },
                           {
                              rotate: winAnimation.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: ["0deg", "360deg"],
                              }),
                           },
                        ],
                     },
                  ]}
               >
                  <Text style={styles.winText}>🎉 You Won! 🎉</Text>
                  <TouchableOpacity
                     style={styles.resetButton}
                     onPress={resetGame}
                  >
                     <Text style={styles.resetButtonText}>Play Again</Text>
                  </TouchableOpacity>
               </Animated.View>
            ) : (
               <>
                  <Text style={styles.info}>{getProgressMessage()}</Text>
                  {holdProgress > 0 && (
                     <Text style={styles.progressText}>
                        {Math.floor(holdProgress)}%
                     </Text>
                  )}
               </>
            )}
         </View>

         <View
            style={[
               styles.ball,
               {
                  left: position.x - BALL_SIZE / 2,
                  top: position.y - BALL_SIZE / 2,
                  backgroundColor: holdProgress
                     ? `rgba(0, ${87 + (168 * holdProgress) / 100}, 34, 0.9)`
                     : "#FF6D3F",
                  shadowColor: "#FF4500",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.5,
                  shadowRadius: 15,
               },
            ]}
         />

         <View style={styles.centerTarget}>
            <View style={styles.centerDot} />
         </View>

         <View style={styles.buttonsContainer}>
            <TouchableOpacity
               style={[styles.button, isActive && styles.buttonDisabled]}
               onPress={() => setIsActive(true)}
               disabled={isActive}
            >
               <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
               style={[styles.button, !isActive && styles.buttonDisabled]}
               onPress={() => setIsActive(false)}
               disabled={!isActive}
            >
               <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#BCEAFF", // Off-white background for the container
   },
   messageContainer: {
      position: "absolute",
      top: 80,
      alignItems: "center",
      paddingHorizontal: 20,
   },
   info: {
      fontSize: 20,
      color: "#333333", // Dark gray for text
      textAlign: "center",
   },
   progressText: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#007bff", // Blue for progress text
   },
   ball: {
      position: "absolute",
      width: BALL_SIZE,
      height: BALL_SIZE,
      borderRadius: BALL_SIZE / 2,
   },
   centerTarget: {
      position: "absolute",
      top: height / 2 - 25,
      left: width / 2 - 25,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "rgba(255,255,255,0.5)", // Adjusted background color for visibility
      justifyContent: "center",
      alignItems: "center",
   },
   centerDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "#000", // Changed to black for visibility
   },
   winTextContainer: {
      alignItems: "center",
   },
   winText: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#007bff", // Blue for win text
      marginBottom: 20,
   },
   resetButton: {
      backgroundColor: "#007bff", // Blue for reset button
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 25,
   },
   resetButtonText: {
      color: "#FFF", // White for reset button text
      fontSize: 16,
   },
   buttonsContainer: {
      position: "absolute",
      bottom: 70,
      flexDirection: "row",
      justifyContent: "space-around",
      width: "80%",
   },
   button: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: "#007bff", // Blue for button
   },
   buttonDisabled: {
      backgroundColor: "#999", // Gray for disabled button
   },
   buttonText: {
      color: "#FFF", // White for button text
      fontSize: 16,
   },
});
