"use client";

import { useEffect, useState } from "react";

type Orientation = Partial<{
  alpha: number;
  beta: number;
  gamma: number;
}>;

// Set field of view limits (in degrees)
const horizontalFOV = 30; // Horizontal field of view in degrees
const verticalFOV = 40; // Vertical field of view in degrees

let a = 0;

const destinationCoords = {
  latitude: 25.648325,
  longitude: -100.284891,
  // latitude: 25.647943,
  // longitude: -100.218141,
};

function calculateBearing(
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

function calculateDistance(
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

function getObjectScale(distance: number) {
  const minScale = 0.1; // Minimum scale factor for far distances
  const maxScale = 2; // Maximum scale factor for near distances
  const maxDistance = 1000; // Max distance in meters for scaling effect

  let scale =
    ((maxDistance - distance) / maxDistance) * (maxScale - minScale) + minScale;
  scale = Math.max(minScale, Math.min(maxScale, scale)); // Clamp the scale between min and max

  return scale;
}

function isObjectVisible(bearing: number, alpha: number, beta: number) {
  const absAngle = Math.abs((alpha - bearing + 360) % 360);
  // Horizontal visibility (left-to-right)
  const horizontalVisible =
    absAngle < horizontalFOV / 2 || absAngle > 360 - horizontalFOV / 2;

  a = Math.abs((alpha - bearing + 360) % 360);

  // Vertical visibility (up-and-down)
  const verticalVisible =
    beta - 90 < verticalFOV / 2 && beta - 90 > -verticalFOV / 2;

  return horizontalVisible && verticalVisible;
}

function getObjectPosition(beta: number, gamma: number) {
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
    x: horizontalPosition,
    y: verticalPosition,
  };
}

async function getMedia() {
  const constraints = {
    video: {
      facingMode: "environment",
    },
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const video = document.querySelector("video");

    if (!video) {
      return;
    }

    video.srcObject = stream;
    video.onloadedmetadata = () => {
      void video.play();
    };
  } catch (err) {
    console.error(err);
  }
}

function getLocation(
  onChangeLocation: (coords: GeolocationCoordinates) => void,
) {
  if (!navigator.geolocation) {
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => onChangeLocation(position.coords),
    (err) => console.error(err),
    {
      enableHighAccuracy: true,
    },
  );
}

export default function Camera() {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [orientation, setOrientation] = useState<Orientation>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [bearing, setBearing] = useState(0);
  const [scale, setScale] = useState(1);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    void getMedia();
    getLocation(setCoords);

    const handleDeviceOrientation = (event: DeviceOrientationEvent): void => {
      if (!event.alpha || !event.beta || !event.gamma) {
        return;
      }

      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      });
    };
    window.addEventListener("deviceorientation", handleDeviceOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, []);

  useEffect(() => {
    if (!coords) {
      return;
    }

    const newBearing = calculateBearing(
      coords.latitude,
      coords.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude,
    );
    setBearing(newBearing);

    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude,
    );
    setScale(getObjectScale(distance));

    const isVisible = isObjectVisible(
      newBearing,
      orientation.alpha ?? 0,
      orientation.beta ?? 0,
    );
    setVisible(isVisible);

    const newPosition = getObjectPosition(
      orientation.beta ?? 0,
      orientation.gamma ?? 0,
    );
    setPosition(newPosition);
  }, [coords, orientation]);

  const arrowStyle = {
    transform: `rotate(${(orientation.alpha ?? 0) - bearing}deg)`,
  };
  const objectStyle = {
    transform: `scale(${scale})`,
    display: visible ? "block" : "none",
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return (
    <div>
      <video
        autoPlay
        playsInline
        style={{ width: "100%", height: "100%" }}
      ></video>
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "50%",
          transform: "translate(-50%)",
        }}
      >
        <div
          style={{
            ...arrowStyle,
            width: "50px",
            height: "50px",
          }}
          className="flex items-center justify-center rounded-full bg-slate-300 text-2xl font-bold"
        >
          ↑
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          style={{
            ...objectStyle,
            width: "100px",
            height: "100px",
            backgroundColor: "red",
            borderRadius: "50%",
          }}
        />
      </div>

      <h1
        style={{ textAlign: "center", marginTop: "20px" }}
        className="break-words"
      >
        {JSON.stringify(objectStyle)}
      </h1>
      {/* <h1 style={{ textAlign: "center", marginTop: "20px" }}>
        visible: {visible ? "true" : "false"}
      </h1>
      <h1 style={{ textAlign: "center", marginTop: "20px" }}>
        position: {position.x.toFixed(2)}, {position.y.toFixed(2)}
      </h1>
      <h1 style={{ textAlign: "center", marginTop: "20px" }}>
        horizontalVisibl: {a.toFixed(2)}, beta: {orientation.beta?.toFixed(2)}
      </h1> */}
    </div>
  );
}
