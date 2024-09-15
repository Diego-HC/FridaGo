interface Detalle {
  area: string;
  cantidad: string;
}

interface Pasillo {
  id: number;
  fecha: string;
  detalles: Detalle[];
}

interface TransformedData {
  fecha: string;
  data: Record<string, string>; // Mapping area (dynamic) to string (cantidad)
}
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const dummyDataPasillo: Pasillo[] = [
  {
    id: 1,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "Jan 2023",
  },
  {
    id: 2,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "Feb 2023",
  },
  {
    id: 3,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "Mar 2023",
  },
  {
    id: 4,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "Apr 2023",
  },
  {
    id: 5,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "May 2023",
  },
  {
    id: 6,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "Jun 2023",
  },
  {
    id: 7,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "Jul 2023",
  },
  {
    id: 8,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "Aug 2023",
  },
  {
    id: 9,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "Sep 2023",
  },
  {
    id: 10,
    detalles: [
      {
        area: "Botana",
        cantidad: getRandomInt(1, 1000).toString(),
      },
      {
        area: "Frutas",
        cantidad: getRandomInt(1, 1000).toString(),
      },
    ],
    fecha: "Oct 2023",
  },
];

const transformedDataPasillo = dummyDataPasillo.reduce<
  Record<string, TransformedData>
>(
  (acc, pasillo) => {
    const fecha = pasillo.fecha;
    if (!acc[fecha]) {
      acc[fecha] = { fecha, data: {} }; // Initialize the 'data' field for each 'fecha'
    }

    pasillo.detalles.forEach((detalle) => {
      if (!acc[fecha]!.data[detalle.area]) {
        acc[fecha]!.data[detalle.area] = "0"; // Initialize the value if it doesn't exist
      }
      acc[fecha]!.data[detalle.area] = detalle.cantidad; // Update with the cantidad
    });

    return acc;
  },
  {} as Record<string, TransformedData>,
);

export const finalDataPasillo = Object.values(transformedDataPasillo);

//----

export const sentimentData = [
  { name: "Positive", value: getRandomInt(1, 100) },
  { name: "Neutral", value: getRandomInt(1, 100) },
  { name: "Negative", value: getRandomInt(1, 100) },
];

export const tiempoFila = [
  { name: "Fila 1", value: getRandomInt(1, 30) },
  { name: "Fila 2", value: getRandomInt(1, 30) },
  { name: "Fila 3", value: getRandomInt(1, 30) },
];
