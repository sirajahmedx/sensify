import { SENSOR_UPDATE_INTERVAL } from "@/constants/constants";

export const calculateDistance = (sensorData) => {
   if (!sensorData.length) return 0;

   let distance = 0;
   const accelerometerData = sensorData.filter(
      (data) => data.type === "accelerometer"
   );
   const gyroscopeData = sensorData.filter((data) => data.type === "gyroscope");

   // Implementation of sensor fusion algorithm
   // This is a simplified version - you may want to implement a more sophisticated
   // algorithm based on your specific needs

   accelerometerData.forEach((data) => {
      // Calculate linear acceleration magnitude
      const magnitude = Math.sqrt(
         Math.pow(data.x, 2) + Math.pow(data.y, 2) + Math.pow(data.z, 2)
      );

      // Apply threshold to filter out noise
      if (magnitude > 0.1) {
         // Convert acceleration to distance
         // This is a basic calculation and might need refinement
         distance +=
            (magnitude * 9.81 * Math.pow(SENSOR_UPDATE_INTERVAL / 1000, 2)) / 2;
      }
   });

   // Apply correction factor based on gyroscope data
   const rotationCorrection = calculateRotationCorrection(gyroscopeData);
   distance *= rotationCorrection;

   return distance;
};

const calculateRotationCorrection = (gyroscopeData) => {
   if (!gyroscopeData.length) return 1;

   // Calculate average rotation
   const avgRotation = gyroscopeData.reduce(
      (acc, data) => {
         return {
            x: acc.x + data.x,
            y: acc.y + data.y,
            z: acc.z + data.z,
         };
      },
      { x: 0, y: 0, z: 0 }
   );

   // Apply correction factor based on rotation
   // This is a simplified approach - you might want to use more sophisticated
   // algorithms for better accuracy
   const rotationMagnitude = Math.sqrt(
      Math.pow(avgRotation.x, 2) +
         Math.pow(avgRotation.y, 2) +
         Math.pow(avgRotation.z, 2)
   );

   return 1 / (1 + rotationMagnitude);
};
