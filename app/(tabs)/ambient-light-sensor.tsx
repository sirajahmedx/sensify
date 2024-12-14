import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Alert, Dimensions } from "react-native";
import { LightSensor } from "expo-sensors";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type IconName = "moon" | "cloudy-night" | "partly-sunny" | "sunny";

const LIGHT_STATES: Record<
  string,
  {
    threshold: number;
    message: string;
    color: string;
    icon: IconName;
  }
> = {
  PITCH_BLACK: {
    threshold: 0,
    message: "Completely Dark",
    color: "#000000",
    icon: "moon",
  },
  VERY_DARK: {
    threshold: 15,
    message: "Very Dim",
    color: "#0d0d0d",
    icon: "cloudy-night",
  },
  DARK: {
    threshold: 50,
    message: "Dim",
    color: "#1a1a1a",
    icon: "partly-sunny",
  },
  DIM: {
    threshold: 100,
    message: "Low Light",
    color: "#4a4a4a",
    icon: "sunny",
  },
  MODERATE: {
    threshold: 200,
    message: "Moderate Light",
    color: "#787878",
    icon: "sunny",
  },
  BRIGHT: {
    threshold: 500,
    message: "Bright Light",
    color: "#a8a8a8",
    icon: "sunny",
  },
  VERY_BRIGHT: {
    threshold: 1000,
    message: "Very Bright Light",
    color: "#d3d3d3",
    icon: "sunny",
  },
  INTENSE: {
    threshold: 10000,
    message: "Intense Light",
    color: "#f5f5f5",
    icon: "sunny",
  },
  EXTREME: {
    threshold: 20000,
    message: "Extremely Bright Light",
    color: "#ffffff",
    icon: "sunny",
  },
};

const AmbientLightSensor: React.FC = () => {
  const [lightLevel, setLightLevel] = useState<number>(0);
  const [colorAnim] = useState<Animated.Value>(() => new Animated.Value(0));
  const [currentState, setCurrentState] = useState(LIGHT_STATES.PITCH_BLACK);
  const [subscription, setSubscription] = useState<any>(null);
  const isFocused = useIsFocused();

  const getLightState = useCallback((illuminance: number) => {
    const states = Object.values(LIGHT_STATES);
    for (let i = 0; i < states.length; i++) {
      if (illuminance <= states[i].threshold) return states[i];
    }
    return LIGHT_STATES.EXTREME;
  }, []);

  const initSensor = useCallback(async () => {
    try {
      const isAvailable = await LightSensor.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Oops! No Ambient Light Sensor Found",
          "Oh no! It seems like your device doesn't have an ambient light sensor.. 😞 Please try again with a device that has it! 💔 We're really sorry! 😓",
        );
        return;
      }

      LightSensor.setUpdateInterval(100);

      const newSubscription = LightSensor.addListener(({ illuminance }) => {
        setLightLevel((prev) => {
          return Math.abs(prev - illuminance) > 0.5 ? illuminance : prev;
        });

        const newState = getLightState(illuminance);
        if (newState !== currentState) {
          setCurrentState(newState);
          Animated.timing(colorAnim, {
            toValue: Object.values(LIGHT_STATES).indexOf(newState),
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      });

      setSubscription(newSubscription);
    } catch (error) {
      console.error("Failed to initialize light sensor:", error);
      Alert.alert("Initialization Error", "An error occurred while initializing the light sensor.");
    }
  }, [currentState, getLightState, colorAnim, isFocused]);

  useEffect(() => {
    if (isFocused) {
      initSensor();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isFocused, initSensor, subscription]);

  const interpolatedColor = useMemo(() => {
    return colorAnim.interpolate({
      inputRange: Object.values(LIGHT_STATES).map((_, i) => i),
      outputRange: Object.values(LIGHT_STATES).map((state) => state.color),
    });
  }, [colorAnim]);

  const textColor =
    currentState === LIGHT_STATES.INTENSE || currentState === LIGHT_STATES.EXTREME
      ? "#000"
      : "#fff";

  const progress = useMemo(() => {
    const maxLight = LIGHT_STATES.EXTREME.threshold;
    return Math.min(lightLevel / maxLight, 1);
  }, [lightLevel]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedColor }]}>
      <View style={styles.card}>
        <Ionicons name={currentState.icon} size={80} color={textColor} style={styles.icon} />
        <Text style={[styles.messageText, { color: textColor }]}>{currentState.message}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: textColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: textColor }]}>
            Light Level: {lightLevel.toFixed(1)} lx
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  card: {
    width: width * 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  icon: {
    marginBottom: 25,
  },
  messageText: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
  },
  progressBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
  },
  progressBar: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "600",
  },
});

export default AmbientLightSensor;
