import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

interface SensitivitySliderProps {
   sensitivity: number;
   setSensitivity: (value: number) => void;
}

export default function SensitivitySlider({
   sensitivity,
   setSensitivity,
}: SensitivitySliderProps) {
   return (
      <View style={styles.container}>
         <Text style={styles.label}>Sensitivity: {sensitivity.toFixed(2)}</Text>
         <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            value={sensitivity}
            onValueChange={setSensitivity}
            minimumTrackTintColor="#228be6"
            maximumTrackTintColor="#d0d0d0"
            thumbTintColor="#228be6"
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      marginVertical: 20,
      flex: 1, // Add flex:1 to ensure proper layout in VirtualizedList
   },
   label: {
      fontSize: 16,
      marginBottom: 8,
      color: "#343a40",
   },
   slider: {
      width: "100%",
      height: 40,
   },
});
