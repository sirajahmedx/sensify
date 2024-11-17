import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Accelerometer } from "expo-sensors";

const TiltControlledLightApp: React.FC = () => {
   const [topBarHeight] = useState(new Animated.Value(0)); // Top bar height
   const [bottomBarHeight] = useState(new Animated.Value(0)); // Bottom bar height
   const [tiltAngle, setTiltAngle] = useState(0);
   const fixedSpacing = 20; // Fixed spacing between center bar and other bars

   useEffect(() => {
      Accelerometer.setUpdateInterval(100); // Moderate update rate

      const subscription = Accelerometer.addListener((accelerometerData) => {
         const { y } = accelerometerData;
         const newTilt = Math.min(Math.max(y, -1), 1);
         setTiltAngle(newTilt);

         let topHeight = 0;
         let bottomHeight = 0;

         // Calculate heights based on tilt direction, hide at 0 degrees
         if (newTilt > 0) {
            topHeight = newTilt * 500; // Increased height for top bar
            bottomHeight = 0;
         } else if (newTilt < 0) {
            topHeight = 0;
            bottomHeight = Math.abs(newTilt) * 500; // Increased height for bottom bar
         }

         // Animate both bars' heights
         Animated.parallel([
            Animated.timing(topBarHeight, {
               toValue: topHeight,
               duration: 150,
               useNativeDriver: false,
            }),
            Animated.timing(bottomBarHeight, {
               toValue: bottomHeight,
               duration: 150,
               useNativeDriver: false,
            }),
         ]).start();
      });

      return () => subscription.remove();
   }, [topBarHeight, bottomBarHeight]);

   return (
      <View style={styles.container}>
         <View style={styles.angleContainer}>
            <Text style={styles.angleText}>
               Tilt Angle: {Math.round(tiltAngle * 90)}°
            </Text>
         </View>

         {/* Top Bar */}
         {tiltAngle > 0 && (
            <Animated.View
               style={[
                  styles.bar,
                  {
                     height: topBarHeight,
                     backgroundColor: "#e74c3c", // Red color for top bar
                     position: "absolute",
                     bottom: "50%", // Start from the middle
                     marginBottom: fixedSpacing, // Fixed gap from the center bar
                  },
               ]}
            />
         )}

         {/* Bottom Bar */}
         {tiltAngle < 0 && (
            <Animated.View
               style={[
                  styles.bar,
                  {
                     height: bottomBarHeight,
                     backgroundColor: "#e74c3c", // Red color for bottom bar
                     position: "absolute",
                     top: "50%", // Start from the middle
                     marginTop: fixedSpacing, // Fixed gap from the center bar
                  },
               ]}
            />
         )}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#ffffff",
   },
   bar: {
      width: 150, // Decreased width to make the bar appear less prominent
      borderRadius: 20,
      shadowOpacity: 0.8,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 0 },
   },
   centerBar: {
      width: 150, // Center bar width decreased
      height: 15, // Increased height for center bar
      backgroundColor: "#008000", // Green color for the center bar
      position: "absolute",
      top: "50%", // Center the bar vertically
      marginTop: -7.5, // Center the 15px bar height
   },
   angleContainer: {
      position: "absolute",
      top: 40,
      right: 20,
   },
   angleText: {
      color: "#000000",
      fontSize: 20,
   },
});

export default TiltControlledLightApp;
