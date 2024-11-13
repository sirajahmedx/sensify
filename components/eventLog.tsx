import React from "react";
import { View, FlatList, Text } from "react-native";

interface EventLogProps {
   logs: { time: string; intensity: number }[];
}

export default function EventLog({ logs }: EventLogProps) {
   return (
      <View>
         <Text style={{ marginVertical: 20 }}>Event Log:</Text>
         <FlatList
            data={logs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
               <Text>
                  {item.time} - Intensity: {item.intensity.toFixed(2)}
               </Text>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
         />
      </View>
   );
}
