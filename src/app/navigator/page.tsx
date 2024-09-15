"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "r/components/ui/card";
import {
  calculateBearing,
  calculateDistance,
  getBestQueue,
  getObjectPosition,
  getObjectScale,
  isObjectVisible,
} from "./utils";
import { useSearchParams } from "next/navigation";
import { Button } from "r/components/ui/button";
import { ShoppingCartIcon, ShoppingCart } from "lucide-react";

type Orientation = {
  alpha: number;
  beta: number;
  gamma: number;
};

const destinationCoords = {
  latitude: 25.6487015,
  longitude: -100.2898314,
  // latitude: 25.647943,
  // longitude: -100.218141,
};

const destinations = [
  {
    name: "CocaCola",
    latitude: 25.6487015,
    longitude: -100.2898314,
  },
  {
    name: "Pepsi",
    latitude: 25.6487135,
    longitude: -100.2898274,
  },
  {
    name: "Manzana",
    latitude: 25.648325,
    longitude: -100.284891,
  },
  {
    name: "Carne-asada",
    latitude: 25.647943,
    longitude: -100.218141,
  },
];

const queues = [
  {
    id: 1,
    latitude: 25.6487115,
    longitude: -100.2898174,
  },
  {
    id: 2,
    latitude: 25.6487135,
    longitude: -100.2898274,
  },
  {
    id: 3,
    latitude: 25.648325,
    longitude: -100.284891,
  },
];

function getCoords({ product, queue }: { product?: number; queue?: number }): {
  latitude: number;
  longitude: number;
} {
  if (product != null && destinations[product]) {
    return destinations[product];
  }
  if (queue != null && queues[queue]) {
    return queues[queue];
  }

  return destinationCoords;
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

function NavigatorInner() {
  const searchParams = useSearchParams();

  const [currentDestination, setCurrentDestination] = useState<
    number | undefined
  >();
  const [bestQueue, setBestQueue] = useState<number | undefined>();

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
  const [imgSource, setImgSource] = useState("");

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
    searchParams.forEach((value, key) => {
      console.log(key, value);
    });

    const dest = searchParams.get("destination");
    if (dest === "queue") {
      // const bestQueue = getBestQueue();
      // setBestQueue(bestQueue);
    } else if (dest != null) {
      console.log(dest);
      const index = destinations.findIndex((d) => d.name === dest);
      if (index === -1) {
        destinations.push({
          name: dest,
          latitude: 25.6487015,
          longitude: -100.2898314,
        });
      }
      setCurrentDestination(destinations.length - 1);
    }

    const imageUrl = searchParams.get("imageUrl");
    if (imageUrl) {
      setImgSource(decodeURIComponent(imageUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    const destinationCoords = getCoords({
      product: currentDestination,
      queue: bestQueue,
    });

    if (!coords || !destinationCoords) {
      return;
    }

    console.log(coords);

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
  }, [bestQueue, coords, currentDestination, orientation]);

  const handleGetQueue = () => {
    console.log("go to line");
    getBestQueue()
      .then((bestQueue) => {
        setBestQueue(bestQueue);
        setCurrentDestination(undefined);
        setImgSource("/shopping-cart-vector-clipart.png");
      })
      .catch((err) => {
        console.error(err);
      });
  };

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

  let text = "";

  if (bestQueue) {
    text = `queue ${bestQueue}`;
  } else if (currentDestination != null) {
    text = `${destinations[currentDestination]?.name}`;
  }

  return (
    <div>
      <div className="absolute top-2 flex w-screen justify-center">
        <Card className="w-11/12 bg-blue-950 bg-opacity-70 text-white">
          <CardHeader>
            <CardTitle className="text-2xl opacity-100">
              Going to {text}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg opacity-100">
            {distance.toFixed(1)}m
          </CardContent>
        </Card>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-3 top-1/4 z-10"
        onClick={handleGetQueue}
      >
        <ShoppingCartIcon className="h-4 w-4" />
      </Button>

      <video autoPlay playsInline style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: "50%",
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSource}
          alt="Product"
          style={{
            ...objectStyle,
            width: "50px",
            height: "50px",
          }}
        />
      </div>

      <div className="my-auto h-auto -translate-y-6 rounded-t-3xl bg-[#0278d3] px-4 py-6 text-white">
        <div className="flex flex-col justify-items-center gap-0">
          <h1 className="text-2xl">
            {bestQueue ? "Queue" : "Next product"}: {text}
          </h1>
          <p>ETA: {Math.ceil(distance / 100)}min</p>
        </div>
      </div>
    </div>
  );
}

export default function Navigator() {
  return (
    <Suspense>
      <NavigatorInner />
    </Suspense>
  );
}
