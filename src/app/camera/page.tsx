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

    const track = stream.getVideoTracks()[0];

    video.srcObject = stream;
    video.onloadedmetadata = () => {
      void video.play();
    };
  } catch (err) {
    /* handle the error */
    console.error(err);
  }
}

export default function Camera() {
  const [orientation, setOrientation] = useState<Orientation>();

  // console.log(window.isSecureContext);

  useEffect(() => {
    void getMedia();

    const handleOrientationEvent = (event: DeviceOrientationEvent): void => {
      console.log(event);

      setOrientation({
        alpha: event.alpha ?? 0,
        beta: event.beta ?? 0,
        gamma: event.gamma ?? 0,
      });
    };
    window.addEventListener("deviceorientation", handleOrientationEvent);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientationEvent);
    };
  }, []);

  // function requestOrientationPermission() {
  //   if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  //       // Request permission for iOS 13+ devices
  //       DeviceOrientationEvent.requestPermission()
  //           .then(function(permissionState) {
  //               if (permissionState === 'granted') {
  //                   window.addEventListener('deviceorientation', handleOrientation);
  //               } else {
  //                   console.log('Permission denied');
  //               }
  //           })
  //           .catch(console.error);
  //   } else {
  //       // Non-iOS devices or older versions
  //       window.addEventListener('deviceorientation', handleOrientation);
  //   }
  // }

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
      </div>
    </div>
  );
}
