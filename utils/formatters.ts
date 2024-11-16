export const formatDistance = (distanceInMeters) => {
   // Convert to inches
   const inches = distanceInMeters * 39.3701;

   if (inches < 12) {
      return `${Math.round(inches)} inches`;
   } else if (inches < 12000) {
      // Less than 1000 feet
      const feet = Math.floor(inches / 12);
      const remainingInches = Math.round(inches % 12);
      return `${feet} ft ${remainingInches} in`;
   } else {
      // Convert to meters for large distances
      return `${Math.round(distanceInMeters)} meters`;
   }
};
