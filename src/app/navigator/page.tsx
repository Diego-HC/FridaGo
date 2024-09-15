"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "r/components/ui/card";
import {
  calculateBearing,
  calculateDistance,
  getObjectPosition,
  getObjectScale,
  isObjectVisible,
} from "./utils";

type Orientation = {
  alpha: number;
  beta: number;
  gamma: number;
};

const destinationCoords = {
  latitude: 25.648325,
  longitude: -100.284891,
  // latitude: 25.647943,
  // longitude: -100.218141,
};

const destinations = [
  {
    name: "Manzana",
    latitude: 25.648325,
    longitude: -100.284891,
  },
  {
    name: "Carne asada",
    latitude: 25.647943,
    longitude: -100.218141,
  },
];

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

export default function Navigator() {
  const [currentDestination, setCurrentDestination] = useState(0);

  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [bearing, setBearing] = useState(0);
  const [distance, setDistance] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

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
    setDistance(distance);
    setScale(getObjectScale(distance));

    const isVisible = isObjectVisible(
      newBearing,
      orientation.alpha,
      orientation.beta,
    );
    setVisible(isVisible);

    const newPosition = getObjectPosition(orientation.beta, orientation.gamma);
    setPosition(newPosition);
  }, [coords, orientation]);

  const arrowStyle = {
    transform: `rotate(${orientation.alpha - bearing}deg)`,
  };
  const objectContainerStyle = {
    display: visible ? "block" : "none",
    left: `${position.x}px`,
    top: `${position.y}px`,
  };
  const objectStyle = {
    transform: `scale(${scale})`,
  };

  return (
    <div>
      <Card className="absolute left-4 top-2 w-11/12 bg-blue-950 bg-opacity-70 text-white">
        <CardHeader>
          <CardTitle className="text-2xl opacity-100">
            Going to {destinations[currentDestination]?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-lg opacity-100">
          {distance.toFixed(1)}m
        </CardContent>
      </Card>
      <video autoPlay playsInline style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translate(-50%) rotate3d(1, 0, 0, 45deg)",
        }}
      >
        <div
          style={{
            ...arrowStyle,
            width: "75px",
            height: "75px",
          }}
          className="flex items-center justify-center rounded-full bg-slate-300 text-4xl font-bold"
        >
          ↑
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          ...objectContainerStyle,
          transform: "translate(50%, -20vh)",
        }}
      >
        <div
          style={{
            ...objectStyle,
            width: "50px",
            height: "50px",
            backgroundColor: "red",
            borderRadius: "50%",
          }}
        />
      </div>

      <div className="-translate-y-6 rounded-t-3xl bg-[#0278d3] px-4 py-6 text-white">
        <div className="flex w-screen flex-col justify-items-center">
          <h1 className="text-2xl">
            Next product: {destinations[currentDestination + 1]?.name}
          </h1>
          <p>ETA: {Math.ceil(distance / 100)}min</p>
        </div>
      </div>
    </div>
  );
}
