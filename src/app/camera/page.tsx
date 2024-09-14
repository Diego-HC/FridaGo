"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Orientation = Partial<{
  alpha: number;
  beta: number;
  gamma: number;
}>;

async function getMedia() {
  const constraints = {
    video: {
      facingMode: "environment",
    },
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    /* use the stream */

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

  const onSuccess: PositionCallback = (res) => {
    console.log(res);

    onChangeLocation(res.coords);
  };
  const onError: PositionErrorCallback = (err) => {
    console.log(err);
  };

  return navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
  });
}

export default function Camera() {
  const [orientation, setOrientation] = useState<Orientation>();
  const [coords, setCoords] = useState<GeolocationCoordinates>();

  useEffect(() => {
    void getMedia();

    const handleOrientationEvent = (event: DeviceOrientationEvent): void => {
      setOrientation({
        alpha: event.alpha ?? 0,
        beta: event.beta ?? 0,
        gamma: event.gamma ?? 0,
      });
    };
    window.addEventListener("deviceorientation", handleOrientationEvent);

    const watchId = getLocation(setCoords);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientationEvent);

      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "80vh" }}>
      <video
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        {/* Overlay content goes here */}
        <Image src="/arrow.png" alt="Arrow" width={100} height={100} />
        <h1 style={{ color: "white", textAlign: "center", marginTop: "20px" }}>
          {orientation?.alpha}, {orientation?.beta}, {orientation?.gamma}
        </h1>
        <h1 style={{ color: "white", textAlign: "center", marginTop: "20px" }}>
          {coords?.latitude}, {coords?.longitude}
        </h1>
      </div>
    </div>
  );
}
