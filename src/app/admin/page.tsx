"use client";

import React, { useRef } from "react";
import { DataTable } from "./data-table";
import { Button } from "r/components/ui/button";
import { columns } from "./columns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";
import { Card, CategoryBar, BarList, LineChart } from "@tremor/react";
import {
  finalDataPasillo,
  getRandomInt,
  sentimentData,
  tiempoFila,
} from "./dummyData";

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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
          .upload(uuidv4(), file);
        if (error) {
          console.error("Error during upload:", error);
        } else {
          console.log("File uploaded successfully:", data);
        }
      } catch (error) {
        console.error("Error during upload:", error);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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

      <h2 className="mb-6 text-3xl font-semibold text-gray-700">Data</h2>
      <h3>Aisle Data</h3>

      <div className="my-10">
        <Card>
          <h3 className="text-tremor-content-strong dark:text-dark-tremor-content-strong text-lg font-medium">
            Cantidad personas por pasillo y fecha
          </h3>
          <LineChart
            data={finalDataPasillo}
            index="fecha"
            categories={["Botana", "Frutas"]}
            xAxisLabel="Fecha"
            yAxisLabel="Cantidad"
            yAxisWidth={65}
          />
        </Card>
      </div>

      <div className="my-10 flex">
        <Card className="w-1/2">
          <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
            Análisis sentimiento clientes después de su compra
          </h3>
          <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-4 flex items-center justify-between">
            <span>Sentimiento</span>
            <span>Cantidad Clientes</span>
          </p>
          <BarList data={sentimentData} sortOrder="none" />
        </Card>

        <Card className="w-1/2">
          <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
            Cantidad espera por fila
          </h3>
          <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-4 flex items-center justify-between">
            <span>Fila</span>
            <span>Tiempo (min)</span>
          </p>
          <BarList data={tiempoFila} sortOrder="descending" />
        </Card>
      </div>
      <div className="space-y-3">
        <p className="text-center font-mono text-sm text-slate-500">
          Porcentaje Stock por area
        </p>
        <div className="flex justify-center">
          <Card className="max-w-sm">
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-4 flex items-center justify-between">
              <span>Productos limpieza</span>
            </p>
            <CategoryBar
              values={[40, 30, 20, 10]}
              colors={["rose", "orange", "yellow", "emerald"]}
              markerValue={getRandomInt(70, 100)}
            />
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-4 flex items-center justify-between">
              <span>Bebidas</span>
            </p>
            <CategoryBar
              values={[40, 30, 20, 10]}
              colors={["rose", "orange", "yellow", "emerald"]}
              markerValue={getRandomInt(40, 90)}
            />
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-4 flex items-center justify-between">
              <span>Botana</span>
            </p>
            <CategoryBar
              values={[40, 30, 20, 10]}
              colors={["rose", "orange", "yellow", "emerald"]}
              markerValue={getRandomInt(60, 83)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
