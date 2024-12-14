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

const INITIAL_BALL_SIZE = 43;
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
          <Animated.View style={[styles.winTextContainer, { opacity: winAnimation }]}>
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
    backgroundColor: "#F1F3F6",
    padding: 20,
  },
  headerContainer: {
    position: "absolute",
    top: 50,
    zIndex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3E3E3E",
    textShadowColor: "#E2E2E2",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subHeaderText: {
    fontSize: 16,
    color: "#8C8C8C",
  },
  messageContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  winTextContainer: {
    backgroundColor: "#4CAF50",
    padding: 20,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  winText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
    textAlign: "center",
  },
  progressText: {
    fontSize: 24,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  info: {
    fontSize: 18,
    color: "#3E3E3E",
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  resetButton: {
    backgroundColor: "#FF6D3F",
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
    marginTop: 20,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  ball: {
    position: "absolute",
    width: INITIAL_BALL_SIZE,
    height: INITIAL_BALL_SIZE,
    borderRadius: INITIAL_BALL_SIZE / 2,
    backgroundColor: "#FF6D3F",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  centerTarget: {
    position: "absolute",
    top: height / 2 - 30,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    position: "absolute",
    bottom: 50,
    zIndex: 2,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    width: 120,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#A1A1A1",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  modalText: {
    fontSize: 18,
    color: "#333333",
    fontWeight: "bold",
    textAlign: "center",
  },
});
