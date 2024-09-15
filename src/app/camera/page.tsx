"use client";

import { useEffect, useState } from "react";

type Orientation = Partial<{
  alpha: number;
  beta: number;
  gamma: number;
}>;

const destinationCoords = {
  latitude: 37.7749,
  longitude: -122.4194,
};

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
    (position) => {
      onChangeLocation(position.coords);
    },
    (err) => {
      console.error(err);
    },
    {
      enableHighAccuracy: true,
    },
  );
}

function calculateBearing(
  start: GeolocationCoordinates,
  end: { latitude: number; longitude: number },
) {
  const startLat = (start.latitude * Math.PI) / 180;
  const startLng = (start.longitude * Math.PI) / 180;
  const endLat = (end.latitude * Math.PI) / 180;
  const endLng = (end.longitude * Math.PI) / 180;

  const dLng = endLng - startLng;
  const x = Math.sin(dLng) * Math.cos(endLat);
  const y =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  const bearing = (Math.atan2(x, y) * 180) / Math.PI;

  return (bearing + 360) % 360;
}

export default function Camera() {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [orientation, setOrientation] = useState<Orientation>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [bearing, setBearing] = useState(0);

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
    if (coords) {
      const newBearing = calculateBearing(coords, destinationCoords);
      setBearing(newBearing);
    }
  }, [coords]);

  const arrowStyle = {
    transform: `rotate(${bearing - (orientation.alpha ?? 0) + (orientation.beta ?? 0) + (orientation.gamma ?? 0)}deg)`,
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
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          style={{
            ...arrowStyle,
            width: "50px",
            height: "50px",
          }}
          className="flex items-center justify-center rounded-full bg-white text-2xl font-bold"
        >
          ↑
        </div>
      </div>
    </div>
  );
}

// "use client";

// import Image from "next/image";
// import { useEffect, useState } from "react";

// type Orientation = Partial<{
//   alpha: number;
//   beta: number;
//   gamma: number;
// }>;

// const destinationCoords = {
//   latitude: 37.7749,
//   longitude: -122.4194,
// };

// async function getMedia() {
//   const constraints = {
//     video: {
//       facingMode: "environment",
//     },
//   };

//   try {
//     const stream = await navigator.mediaDevices.getUserMedia(constraints);
//     /* use the stream */

//     const video = document.querySelector("video");

//     if (!video) {
//       return;
//     }

//     video.srcObject = stream;
//     video.onloadedmetadata = () => {
//       void video.play();
//     };
//   } catch (err) {
//     console.error(err);
//   }
// }

// function getLocation(
//   onChangeLocation: (coords: GeolocationCoordinates) => void,
// ) {
//   if (!navigator.geolocation) {
//     return;
//   }

//   const onSuccess: PositionCallback = (res) => {
//     console.log(res);

//     onChangeLocation(res.coords);
//   };
//   const onError: PositionErrorCallback = (err) => {
//     console.log(err);
//   };

//   return navigator.geolocation.watchPosition(onSuccess, onError, {
//     enableHighAccuracy: true,
//   });
// }

// export default function Camera() {
//   const [orientation, setOrientation] = useState<Orientation>();
//   const [coords, setCoords] = useState<GeolocationCoordinates>();

//   useEffect(() => {
//     void getMedia();

//     const handleOrientationEvent = (event: DeviceOrientationEvent): void => {
//       setOrientation({
//         alpha: event.alpha ?? 0,
//         beta: event.beta ?? 0,
//         gamma: event.gamma ?? 0,
//       });
//     };
//     window.addEventListener("deviceorientation", handleOrientationEvent);

//     const watchId = getLocation(setCoords);

//     return () => {
//       window.removeEventListener("deviceorientation", handleOrientationEvent);

//       if (watchId) {
//         navigator.geolocation.clearWatch(watchId);
//       }
//     };
//   }, []);

//   return (
//     <div style={{ position: "relative", width: "100vw", height: "80vh" }}>
//       <video
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           zIndex: 1,
//         }}
//       />
//       <div
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           zIndex: 2,
//           pointerEvents: "none",
//         }}
//       >
//         {/* Overlay content goes here */}
//         <Image src="/arrow.png" alt="Arrow" width={100} height={100} />
//         <h1 style={{ color: "white", textAlign: "center", marginTop: "20px" }}>
//           {coords?.latitude}, {coords?.longitude}
//         </h1>
//         <h1 style={{ color: "white", textAlign: "center", marginTop: "20px" }}>
//           {orientation?.alpha}, {orientation?.beta}, {orientation?.gamma}
//         </h1>
//       </div>
//     </div>
//   );
// }
