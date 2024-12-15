import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Alert } from "react-native";
import { Accelerometer } from "expo-sensors";

const SurfaceLevelDetector: React.FC = () => {
  const [topBarHeight] = useState(new Animated.Value(0));
  const [bottomBarHeight] = useState(new Animated.Value(0));
  const [tiltAngle, setTiltAngle] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const fixedSpacing = 20;

  useEffect(() => {
    Accelerometer.isAvailableAsync().then((available) => {
      if (!available) {
        setSensorAvailable(false);
        Alert.alert(
          "Sensor Not Available",
          "The accelerometer sensor is not available on your device.",
        );
      } else {
        Accelerometer.setUpdateInterval(100);

        const subscription = Accelerometer.addListener((accelerometerData) => {
          const { y } = accelerometerData;
          const newTilt = Math.min(Math.max(y, -1), 1);
          setTiltAngle(newTilt);

          let topHeight = 0;
          let bottomHeight = 0;

          if (newTilt > 0) {
            topHeight = 0;
            bottomHeight = Math.abs(newTilt) * 350;
          } else if (newTilt < 0) {
            topHeight = Math.abs(newTilt) * 350;
            bottomHeight = 0;
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
      }
    });
  }, [topBarHeight, bottomBarHeight]);

  if (!sensorAvailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Accelerometer sensor not available on your device.</Text>
      </View>
    );
  }

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
              height: bottomBarHeight,
              backgroundColor: "#FF0000", // Changed color to red
              position: "absolute",
              top: "50%",
              marginTop: fixedSpacing,
            },
          ]}
        />
      )}

      {tiltAngle < 0 && (
        <Animated.View
          style={[
            styles.bar,
            {
              height: topBarHeight,
              backgroundColor: "#FF0000", // Changed color to red
              position: "absolute",
              bottom: "50%",
              marginBottom: fixedSpacing,
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
    backgroundColor: "#F8F8F8",
  },
  bar: {
    width: 130,
    borderRadius: 15,
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
    color: "#212529",
    fontSize: 50,
  },
  errorText: {
    fontSize: 20,
    color: "#FF6F61",
    textAlign: "center",
  },
});

export default SurfaceLevelDetector;
