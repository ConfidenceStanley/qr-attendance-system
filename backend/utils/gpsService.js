/**
 * Haversine formula - calculates straight-line distance
 * between two GPS coordinates in meters
 *
 * @param {number} lat1 - Classroom latitude
 * @param {number} lon1 - Classroom longitude
 * @param {number} lat2 - Student latitude
 * @param {number} lon2 - Student longitude
 * @returns {number} Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters

  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // meters, rounded to integer
};

/**
 * Check if student is within allowed radius of classroom
 * @returns {boolean}
 */
const isWithinRadius = (distance, radius) => {
  return distance <= radius;
};

/**
 * Friendly distance string for response messages
 * e.g. "23m" or "1.2km"
 */
const formatDistance = (meters) => {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

module.exports = { calculateDistance, isWithinRadius, formatDistance };