import React from "react";
import { DataTable } from "./data-table";
import { Button } from "r/components/ui/button";
import { columns } from "./columns";

type Pasillo = {
  id: number;
  nombre: string;
  cantidad: string;
  fecha: Date;
};

const dummyData: Pasillo[] = [
  {
    id: 1,
    nombre: "Frutas",
    cantidad: "10",
    fecha: new Date("2023-01-01"),
  },
  {
    id: 2,
    nombre: "Botana",
    cantidad: "20",
    fecha: new Date("2023-02-01"),
  },
  {
    id: 3,
    nombre: "Bebidas",
    cantidad: "30",
    fecha: new Date("2023-03-01"),
  },
];

export default function AdminDashboard() {
  return (
    <div className="bg-gray-70 min-h-screen p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-5xl font-bold text-gray-800">Admin Dashboard</h1>
        <Button variant="outline">Upload data</Button>
      </div>

      <h2 className="mb-6 text-3xl font-semibold text-gray-700">My Data</h2>

      <DataTable columns={columns} data={dummyData} />
    </div>
  );
}
