import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
  Platform,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const { width, height } = Dimensions.get("window");

const INITIAL_BALL_SIZE = 38;
const INITIAL_CENTER_THRESHOLD = 10;
const INITIAL_WIN_DURATION = 5000;
const MAX_LEVEL = 10;

interface Position {
  x: number;
  y: number;
}

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export default function App() {
  const [position, setPosition] = useState<Position>({ x: width / 2, y: height / 2 });
  const [data, setData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  const [isSensorAvailable, setIsSensorAvailable] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [winDuration, setWinDuration] = useState<number>(INITIAL_WIN_DURATION);

  const holdStartTimeRef = useRef<number | null>(null);
  const winAnimation = useRef(new Animated.Value(0)).current;

  const checkSensorAvailability = useCallback(async () => {
    try {
      const isAvailable = await Accelerometer.isAvailableAsync();
      setIsSensorAvailable(isAvailable);
    } catch (error) {
      console.error("Sensor availability check failed:", error);
      setIsSensorAvailable(false);
    }
  }, []);

  const calculateNewPosition = useCallback(
    (currentPos: Position, accelerationData: AccelerometerData): Position => {
      const newX = Math.max(
        0,
        Math.min(width - INITIAL_BALL_SIZE, currentPos.x - accelerationData.x * 20),
      );
      const newY = Math.max(
        0,
        Math.min(height - INITIAL_BALL_SIZE, currentPos.y + accelerationData.y * 20),
      );
      return { x: newX, y: newY };
    },
    [],
  );

  const advanceLevel = useCallback(() => {
    const nextLevel = Math.min(currentLevel + 1, MAX_LEVEL);
    setCurrentLevel(nextLevel);
    setIsActive(false);
    if (nextLevel === MAX_LEVEL) {
      setCurrentLevel(1);
      setIsActive(false);
    }

    setScore((prevScore) => prevScore + 1);

    const newWinDuration = INITIAL_WIN_DURATION + nextLevel * 1000;
    setWinDuration(newWinDuration);
  }, [currentLevel]);

  const resetGame = useCallback(() => {
    setHasWon(false);
    setHoldProgress(0);
    holdStartTimeRef.current = null;
    setPosition({ x: width / 2, y: height / 2 });
    winAnimation.setValue(0);
  }, [winAnimation]);

  useEffect(() => {
    checkSensorAvailability();
  }, [checkSensorAvailability]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    if (isActive && isSensorAvailable) {
      subscription = Accelerometer.addListener((accelerometerData) => {
        setData(accelerometerData);
      });

      Accelerometer.setUpdateInterval(16);
    }

    return () => subscription?.remove();
  }, [isActive, isSensorAvailable]);

  useEffect(() => {
    if (!isActive || hasWon || !isSensorAvailable) return;

    const newPosition = calculateNewPosition(position, data);
    const centerX = width / 2;
    const centerY = height / 2;

    const distanceFromCenter = Math.sqrt(
      Math.pow(newPosition.x - centerX, 2) + Math.pow(newPosition.y - centerY, 2),
    );

    const isCentered = distanceFromCenter <= INITIAL_CENTER_THRESHOLD;

    if (isCentered) {
      if (!holdStartTimeRef.current) {
        holdStartTimeRef.current = Date.now();
      } else {
        const elapsedTime = Date.now() - holdStartTimeRef.current;
        const newProgress = Math.min((elapsedTime / winDuration) * 100, 100);
        setHoldProgress(newProgress);

        if (elapsedTime >= winDuration) {
          setHasWon(true);
          advanceLevel();
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

    if (newPosition.x !== position.x || newPosition.y !== position.y) {
      setPosition(newPosition);
    }
  }, [data, isActive, hasWon, calculateNewPosition, isSensorAvailable, winDuration, advanceLevel]);

  const renderPermissionModal = () => {
    if (!isSensorAvailable) {
      return (
        <Modal transparent={true} animationType="slide" visible={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Unfortunately, the accelerometer sensor is not available on this device.
              </Text>
            </View>
          </View>
        </Modal>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Level {currentLevel} | Score: {score}
        </Text>
        <Text style={styles.subHeaderText}>
          Hold Time: {(winDuration / 1000).toFixed(1)} seconds
        </Text>
      </View>

      {renderPermissionModal()}

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
            <Text style={styles.winText}>🎉 Level Up! 🎉</Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
              <Text style={styles.resetButtonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <>
            <Text style={styles.info}>
              Move the ball to the center and hold for {(winDuration / 1000).toFixed(1)} seconds!
            </Text>
            {holdProgress > 0 && (
              <Text style={styles.progressText}>{Math.floor(holdProgress)}%</Text>
            )}
          </>
        )}
      </View>

      <View
        style={[
          styles.ball,
          {
            left: position.x - INITIAL_BALL_SIZE / 2,
            top: position.y - INITIAL_BALL_SIZE / 2,
            backgroundColor: holdProgress
              ? `rgba(0, ${87 + (168 * holdProgress) / 100}, 34, 0.9)`
              : "#FF6D3F",
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
          disabled={isActive || !isSensorAvailable}
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
  },
  headerContainer: {
    position: "absolute",
    top: 60,
    width: "100%",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#F1F1F1",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2F4F4F", // Darker gray for a cleaner look
    letterSpacing: 0.5,
  },
  subHeaderText: {
    fontSize: 18,
    color: "#7F8C8D", // Lighter gray
  },
  messageContainer: {
    position: "absolute",
    top: 120,
    alignItems: "center",
    width: "80%",
    paddingHorizontal: 15,
  },
  info: {
    fontSize: 20,
    color: "#000000", // Darker color for the instruction text
    textAlign: "center",
    marginTop: 20,
  },
  progressText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FF6347", // Vibrant orange for progress text
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  ball: {
    position: "absolute",
    width: INITIAL_BALL_SIZE,
    height: INITIAL_BALL_SIZE,
    borderRadius: INITIAL_BALL_SIZE / 2,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  centerTarget: {
    position: "absolute",
    top: height / 2 - 30,
    left: width / 2 - 30,
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#007bff", // Blue border for visibility
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 7.5,
    backgroundColor: "#007bff", // Bright blue center dot
  },
  winTextContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  winText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#34A853", // Green for win message
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  resetButton: {
    backgroundColor: "#007bff", // Blue reset button
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  resetButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    paddingHorizontal: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: "#34A853", // Green for action button
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#B0BEC5", // Gray for disabled button
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent backdrop
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
  },
  modalText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 25,
  },
});
