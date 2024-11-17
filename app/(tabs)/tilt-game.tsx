import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Accelerometer } from "expo-sensors";

const TiltControlledLightApp: React.FC = () => {
   const [topBarHeight] = useState(new Animated.Value(0));
   const [bottomBarHeight] = useState(new Animated.Value(0));
   const [tiltAngle, setTiltAngle] = useState(0);
   const fixedSpacing = 20;

   useEffect(() => {
      Accelerometer.setUpdateInterval(100);

      const subscription = Accelerometer.addListener((accelerometerData) => {
         const { y } = accelerometerData;
         const newTilt = Math.min(Math.max(y, -1), 1);
         setTiltAngle(newTilt);

         let topHeight = 0;
         let bottomHeight = 0;

         if (newTilt > 0) {
            topHeight = newTilt * 350;
            bottomHeight = 0;
         } else if (newTilt < 0) {
            topHeight = 0;
            bottomHeight = Math.abs(newTilt) * 350;
         }

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
            <Text style={styles.angleText}>{Math.round(tiltAngle * 90)}°</Text>
         </View>

         {tiltAngle === 0 && <View style={styles.centerBar} />}

         {tiltAngle > 0 && (
            <Animated.View
               style={[
                  styles.bar,
                  {
                     height: topBarHeight,
                     backgroundColor: "#e74c3c",
                     position: "absolute",
                     bottom: "50%",
                     marginBottom: fixedSpacing,
                  },
               ]}
            />
         )}

         {tiltAngle < 0 && (
            <Animated.View
               style={[
                  styles.bar,
                  {
                     height: bottomBarHeight,
                     backgroundColor: "#e74c3c",
                     position: "absolute",
                     top: "50%",
                     marginTop: fixedSpacing,
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
      width: 200,
      borderRadius: 20,
      shadowOpacity: 0.8,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 0 },
   },
   centerBar: {
      width: 150,
      height: 10,
      backgroundColor: "#008000",
      position: "absolute",
      top: "50%",
      marginTop: -5,
   },
   angleContainer: {
      position: "absolute",
      top: 40,
      right: 20,
   },
   angleText: {
      color: "#000000",
      fontSize: 50,
   },
});

export default TiltControlledLightApp;
