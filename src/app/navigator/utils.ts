// Set field of view limits (in degrees)
const horizontalFOV = 30; // Horizontal field of view in degrees
const verticalFOV = 50; // Vertical field of view in degrees

export function calculateBearing(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const toDegrees = (radians: number) => (radians * 180) / Math.PI;

  const deltaLng = toRadians(targetLng - userLng);
  const userLatRad = toRadians(userLat);
  const targetLatRad = toRadians(targetLat);

  const y = Math.sin(deltaLng) * Math.cos(targetLatRad);
  const x =
    Math.cos(userLatRad) * Math.sin(targetLatRad) -
    Math.sin(userLatRad) * Math.cos(targetLatRad) * Math.cos(deltaLng);

  let bearing = toDegrees(Math.atan2(y, x));
  bearing = (bearing + 360) % 360; // Normalize the bearing

  return bearing;
}

export function calculateDistance(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const lat1 = toRadians(userLat);
  const lat2 = toRadians(targetLat);
  const deltaLat = toRadians(targetLat - userLat);
  const deltaLng = toRadians(targetLng - userLng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function getObjectScale(distance: number) {
  const minScale = 0.1; // Minimum scale factor for far distances
  const maxScale = 2; // Maximum scale factor for near distances
  const maxDistance = 1000; // Max distance in meters for scaling effect

  let scale =
    ((maxDistance - distance) / maxDistance) * (maxScale - minScale) + minScale;
  scale = Math.max(minScale, Math.min(maxScale, scale)); // Clamp the scale between min and max

  return scale;
}

export function isObjectVisible(bearing: number, alpha: number, beta: number) {
  const absAngle = Math.abs((alpha - bearing + 360) % 360);
  // Horizontal visibility (left-to-right)
  const horizontalVisible =
    absAngle < horizontalFOV / 2 || absAngle > 360 - horizontalFOV / 2;

  // Vertical visibility (up-and-down)
  const verticalVisible = beta - 90 < verticalFOV && beta - 90 > -verticalFOV;

  return horizontalVisible && verticalVisible;
}

export function getObjectPosition(beta: number, gamma: number) {
  const maxTilt = 45; // Max tilt considered for positioning
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Horizontal position based on gamma (side-to-side tilt)
  const horizontalPosition =
    (gamma / maxTilt) * (screenWidth / 2) + screenWidth / 2;

  // Vertical position based on beta (front-to-back tilt)
  const verticalPosition =
    (beta / maxTilt) * (screenHeight / 2) + screenHeight / 2;

  return {
    x: horizontalPosition * 0.7,
    y: verticalPosition * 0.4,
  };
}