"use client";

import React, { useRef } from "react";
import { DataTable } from "./data-table";
import { Button } from "r/components/ui/button";
import { columns } from "./columns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supabase = createClientComponentClient();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const bucket = "market-inventory";
    if (file) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(file.name, file);
        if (error) {
          console.error("Error during upload:", error);
        } else {
          console.log("File uploaded successfully:", data);
        }
      } catch (error) {
        console.error("Error during upload:", error);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-gray-70 min-h-screen p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-5xl font-bold text-gray-800">Admin Dashboard</h1>
        <Button variant="outline" onClick={triggerFileInput}>
          Upload data
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".pdf,.xlsx"
          onChange={handleFileUpload}
        />
      </div>

      <h2 className="mb-6 text-3xl font-semibold text-gray-700">My Data</h2>

      <DataTable columns={columns} data={dummyData} />
    </div>
  );
}
