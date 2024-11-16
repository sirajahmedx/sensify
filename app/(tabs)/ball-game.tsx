import React, { useState, useEffect } from "react";
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
const BALL_SIZE = 40;
const CENTER_THRESHOLD = 10;
const WIN_DURATION = 5000;

export default function App() {
   const [position, setPosition] = useState({ x: width / 2, y: height / 2 });
   const [data, setData] = useState({ x: 0, y: 0, z: 0 });
   const [holdStartTime, setHoldStartTime] = useState(null);
   const [hasWon, setHasWon] = useState(false);
   const [holdProgress, setHoldProgress] = useState(0);
   const [winAnimation, setWinAnimation] = useState(new Animated.Value(0)); // Animated value for win animation

   useEffect(() => {
      const subscription = Accelerometer.addListener((accelerometerData) => {
         setData(accelerometerData);
      });

      Accelerometer.setUpdateInterval(16);

      return () => subscription.remove();
   }, []);

   useEffect(() => {
      const { x, y } = data;
      setPosition((prev) => ({
         x: Math.max(0, Math.min(width - BALL_SIZE, prev.x - x * 20)),
         y: Math.max(0, Math.min(height - BALL_SIZE, prev.y + y * 20)),
      }));
   }, [data]);

   useEffect(() => {
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
            if (!holdStartTime) {
               setHoldStartTime(Date.now());
            } else {
               const elapsedTime = Date.now() - holdStartTime;
               const newProgress = Math.min(
                  (elapsedTime / WIN_DURATION) * 100,
                  100
               );
               setHoldProgress(newProgress);

               if (elapsedTime >= WIN_DURATION) {
                  setHasWon(true);
                  // Start win animation when the player wins
                  Animated.timing(winAnimation, {
                     toValue: 1,
                     duration: 500,
                     useNativeDriver: true,
                  }).start();
               }
            }
         } else {
            setHoldStartTime(null);
            setHoldProgress(0);
         }
      }
   }, [position, holdStartTime, hasWon]);

   const resetGame = () => {
      setHasWon(false);
      setHoldProgress(0);
      setHoldStartTime(null);
      // Reset the animation value when the game is reset
      winAnimation.setValue(0);
   };

   const getProgressMessage = () => {
      if (holdProgress === 0) {
         return "Move the ball to the center and hold for 5 seconds!";
      }
      const remainingSeconds = Math.ceil(
         (WIN_DURATION - (WIN_DURATION * holdProgress) / 100) / 1000
      );
      return `Keep holding! ${remainingSeconds} seconds remaining`;
   };

   return (
      <View style={styles.container}>
         <View style={styles.messageContainer}>
            {hasWon ? (
               <View style={styles.winContainer}>
                  <Animated.View
                     style={[
                        styles.winTextContainer,
                        {
                           opacity: winAnimation, // Animating opacity
                           transform: [
                              {
                                 scale: winAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.5], // Scale from 1 to 1.5
                                 }),
                              },
                           ],
                        },
                     ]}
                  >
                     <Text style={styles.winText}>You Won! 🎉</Text>
                     <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetGame}
                     >
                        <Text style={styles.resetButtonText}>Play Again</Text>
                     </TouchableOpacity>
                  </Animated.View>
               </View>
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
                  backgroundColor:
                     holdProgress > 0
                        ? `rgb(255, ${87 + (168 * holdProgress) / 100}, 34)`
                        : "#ff5722",
               },
            ]}
         />

         <View style={styles.centerTarget}>
            <View style={styles.centerDot} />
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
   },
   messageContainer: {
      position: "absolute",
      top: 80,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 1,
      paddingHorizontal: 20,
   },
   info: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 10,
      color: "#333",
   },
   progressText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#ff5722",
   },
   ball: {
      position: "absolute",
      width: BALL_SIZE,
      height: BALL_SIZE,
      borderRadius: BALL_SIZE / 2,
      backgroundColor: "#ff5722",
      zIndex: 0,
   },
   centerTarget: {
      position: "absolute",
      top: height / 2 - 15,
      left: width / 2 - 15,
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 3,
      borderColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 0,
   },
   centerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(0,0,0,0.5)",
   },
   winContainer: {
      alignItems: "center",
   },
   winTextContainer: {
      alignItems: "center",
      justifyContent: "center",
   },
   winText: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#4CAF50",
   },
   resetButton: {
      backgroundColor: "#007AFF",
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 5,
      alignItems: "center",
      marginTop: 10,
   },
   resetButtonText: {
      fontSize: 18,
      color: "#fff",
      fontWeight: "bold",
   },
});
