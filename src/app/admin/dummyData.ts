export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Aisle = {
  id: number;
  date: string;
  Snacks: string;
  Fruits: string;
  Drinks: string;
};

export const dummyDataAisle: Aisle[] = [
  {
    id: getRandomInt(1, 10000),
    date: "2023-01-01",
    Snacks: getRandomInt(1, 100).toString(),
    Fruits: getRandomInt(1, 100).toString(),
    Drinks: getRandomInt(1, 100).toString(),
  },
  {
    id: getRandomInt(1, 10000),
    date: "2023-02-01",
    Snacks: getRandomInt(1, 100).toString(),
    Fruits: getRandomInt(1, 100).toString(),
    Drinks: getRandomInt(1, 100).toString(),
  },
  {
    id: getRandomInt(1, 10000),
    date: "2023-03-01",
    Snacks: getRandomInt(1, 100).toString(),
    Fruits: getRandomInt(1, 100).toString(),
    Drinks: getRandomInt(1, 100).toString(),
  },
  {
    id: getRandomInt(1, 10000),
    date: "2023-04-01",
    Snacks: getRandomInt(1, 100).toString(),
    Fruits: getRandomInt(1, 100).toString(),
    Drinks: getRandomInt(1, 100).toString(),
  },
  {
    id: getRandomInt(1, 10000),
    date: "2023-05-01",
    Snacks: getRandomInt(1, 100).toString(),
    Fruits: getRandomInt(1, 100).toString(),
    Drinks: getRandomInt(1, 100).toString(),
  },
  {
    id: getRandomInt(1, 10000),
    date: "2023-06-01",
    Snacks: getRandomInt(1, 100).toString(),
    Fruits: getRandomInt(1, 100).toString(),
    Drinks: getRandomInt(1, 100).toString(),
  },
];
//----

export const sentimentData = [
  {
    Positive: getRandomInt(1, 50),
    Neutral: getRandomInt(1, 40),
    Negative: getRandomInt(1, 20),
    date: "Jan 2023",
  },
  {
    Positive: getRandomInt(1, 50),
    Neutral: getRandomInt(1, 30),
    Negative: getRandomInt(1, 30),
    date: "Feb 2023",
  },
];

export const waitTimeLane = [
  { name: "First lane", value: getRandomInt(1, 30) },
  { name: "Second lane", value: getRandomInt(1, 30) },
  { name: "Third lane", value: getRandomInt(1, 30) },
];
