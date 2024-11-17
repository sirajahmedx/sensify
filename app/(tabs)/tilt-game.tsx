import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Accelerometer } from "expo-sensors";

const TiltControlledLightApp: React.FC = () => {
   const [topBarHeight] = useState(new Animated.Value(0)); // Top bar height
   const [bottomBarHeight] = useState(new Animated.Value(0)); // Bottom bar height
   const [tiltAngle, setTiltAngle] = useState(0);
   const [lightColor] = useState(new Animated.Value(0)); // Controls color

   useEffect(() => {
      Accelerometer.setUpdateInterval(100); // Moderate update rate

      const subscription = Accelerometer.addListener((accelerometerData) => {
         const { y } = accelerometerData;
         const newTilt = Math.min(Math.max(y, -1), 1);
         setTiltAngle(newTilt);

         let topHeight = 0;
         let bottomHeight = 0;

         // Calculate heights based on tilt direction
         if (newTilt > 0) {
            topHeight = newTilt * 300; // Increased max height for top bar
            bottomHeight = 0; // Hide bottom bar
         } else if (newTilt < 0) {
            topHeight = 0; // Hide top bar
            bottomHeight = Math.abs(newTilt) * 300; // Increased max height for bottom bar
         }

         // Animate both bars' heights and color based on tilt
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
            Animated.timing(lightColor, {
               toValue: newTilt,
               duration: 150,
               useNativeDriver: false,
            }),
         ]).start();
      });

      return () => subscription.remove();
   }, [topBarHeight, bottomBarHeight, lightColor]);

   // Interpolated color based on tilt
   const interpolatedColor = lightColor.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ["#e74c3c", "#00FF00", "#3498db"], // Color shift: red -> green -> blue
   });

   return (
      <View style={styles.container}>
         <Text style={styles.angleText}>
            Tilt Angle: {Math.round(tiltAngle * 90)}°
         </Text>

         {/* Top Bar */}
         <Animated.View
            style={[
               styles.bar,
               {
                  height: topBarHeight,
                  backgroundColor: interpolatedColor,
                  position: "absolute",
                  bottom: "50%", // Align from center
                  transform: [
                     {
                        translateY: topBarHeight.interpolate({
                           inputRange: [0, 300],
                           outputRange: [0, -150],
                        }),
                     },
                  ],
               },
            ]}
         />

         {/* Bottom Bar */}
         <Animated.View
            style={[
               styles.bar,
               {
                  height: bottomBarHeight,
                  backgroundColor: interpolatedColor,
                  position: "absolute",
                  top: "50%", // Align from center
                  transform: [
                     {
                        translateY: bottomBarHeight.interpolate({
                           inputRange: [0, 300],
                           outputRange: [0, 150],
                        }),
                     },
                  ],
               },
            ]}
         />
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
      width: 200, // Increased width for better visibility
      borderRadius: 20,
      shadowOpacity: 0.8,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 0 },
   },
   angleText: {
      color: "#000000",
      fontSize: 20,
      marginBottom: 20,
   },
});

export default TiltControlledLightApp;
