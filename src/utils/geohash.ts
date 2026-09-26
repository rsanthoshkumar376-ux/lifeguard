// Note: Depending on the specific geohash library (e.g. geofire-common), the exact implementation of encode/bounds may vary.
// Here we mock the required structure for geohash operations to run successfully.
// You can replace these with your preferred geohash library's real implementation later.

export const encodeGeohash = (lat: number, lng: number, precision: number = 9): string => {
  // A simple placeholder for encode function.
  // Real implementation typically requires a library like 'ngeohash' or 'geofire-common'
  return `${lat},${lng}-hash`; 
};

export const decodeGeohash = (hash: string) => {
  // Placeholder decode function.
  return { latitude: 0, longitude: 0 };
};

export const getGeohashRange = (lat: number, lng: number, radiusKm: number) => {
  // Returns bounds for Firestore queries
  // Needs actual library (geofire-common) to return precise upper/lower bounds.
  return { lower: 'aaa', upper: 'zzz' }; 
};

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};
