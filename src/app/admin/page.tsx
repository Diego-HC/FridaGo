"use client";

import React, { useRef, useState } from "react";
import { DataTable } from "./data-table";
import { Button } from "r/components/ui/button";
import { columns } from "./columns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";
import { Card, CategoryBar, BarList, LineChart, BarChart } from "@tremor/react";
import { MdOutlineFileUpload, MdChatBubbleOutline } from "react-icons/md";


import {
  dummyDataAisle,
  getRandomInt,
  sentimentData,
  waitTimeLane,
} from "./dummyData";


import Chatbot from "./Chatbot";
import ImageView from "./image-view";

export default function AdminDashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [view, setView] = useState("heatmap");
  const [viewTitle, setViewTitle] = useState("Heatmap");
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

  const handleChatOpen = () => {
    setIsChatOpen(true);
  };

  const handleOpenView = (src: string, alt: string) => {
    setView(src);
    setViewTitle(alt);
    setOpenView(true);
  };

  const handleChatClosed = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="bg-gray-70 min-h-screen p-12 bg-slate-50">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-5xl font-bold text-gray-800">FridaGo</h1>
        <div className="flex gap-8">
          <Button variant="outline" onClick={triggerFileInput}>
            <MdOutlineFileUpload className="mr-2 text-lg" />
            Upload data
          </Button>
          <Button variant="outline" onClick={handleChatOpen}>
            <MdChatBubbleOutline className="mr-2 text-lg" />
            Open Chat
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.xlsx"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <h2 className="mb-6 text-3xl font-semibold text-gray-700">
        Admin Dashboard
      </h2>
      <h3>Summarized aisle data in the supermarket</h3>

      <div className="p-8">
        <div className="my-10 flex flex-row gap-10">
          <Card>
            <h3 className="text-tremor-content-strong dark:text-dark-tremor-content-strong text-lg font-medium">
              Number of people per aisle and date
            </h3>
            <LineChart
              data={dummyDataAisle}
              index="date"
              categories={["Snacks", "Fruits", "Drinks"]}
              xAxisLabel="Date"
              yAxisLabel="Quantity"
              yAxisWidth={65}
            />
          </Card>
          <Card className="max-w-sm">
            <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
              Percentage Stock by Area
            </h3>
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-4 flex items-center justify-between">
              <span>Cleaning products</span>
            </p>
            <CategoryBar
              values={[40, 30, 15, 15]}
              colors={["rose", "orange", "yellow", "emerald"]}
              markerValue={getRandomInt(70, 100)}
            />
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-4 flex items-center justify-between">
              <span>Drinks</span>
            </p>
            <CategoryBar
              values={[40, 30, 15, 15]}
              colors={["rose", "orange", "yellow", "emerald"]}
              markerValue={getRandomInt(40, 90)}
            />
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-4 flex items-center justify-between">
              <span>Snacks</span>
            </p>
            <CategoryBar
              values={[40, 30, 15, 15]}
              colors={["rose", "orange", "yellow", "emerald"]}
              markerValue={getRandomInt(60, 83)}
            />
          </Card>
        </div>

        <div className="my-10 flex flex-row gap-10">
          <Card className="w-1/2">
            <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
              Sentiment analysis of customers after their purchase
            </h3>
            <BarChart
              data={sentimentData}
              index="date"
              categories={["Positive", "Neutral", "Negative"]}
              colors={["emerald", "gray", "rose"]}
              xAxisLabel="Date"
              yAxisLabel="Quantity"
            />
          </Card>

          <Card className="w-1/2">
            <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
              Wait time per lane
            </h3>
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mt-4 flex items-center justify-between">
              <span>Lane</span>
              <span>Wait time (min)</span>
            </p>
            <BarList data={waitTimeLane} sortOrder="descending" />
          </Card>
        </div>
        <div className="space-y-3">
          <p className="text-center font-mono text-sm text-slate-500">

          </p>

        </div>
        <div className="flex flex-row gap-10">
          <Card>
            <h3 className="text-tremor-title pb-3 text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
              Aisle View Real Time
            </h3>
            <img src="http://localhost:8000/aisle_view" alt="Video Feed" className=""></img>
          </Card>

          <div className="flex flex-col gap-10">

            <Button variant="outline" className="h-40 flex flex-col" onClick={() => handleOpenView("http://localhost:8000/get_heatmap", "Heatmap")}>
              <p className="text-left font-mono text-sm text-slate-500">
                Heatmap
              </p>
              <img src="http://localhost:8000/get_heatmap" alt="Video Feed" className="p-2 w-48"></img>
            </Button>
            <Button variant="outline" className="h-40 flex flex-col" onClick={() => handleOpenView("http://localhost:8000/get_trajectories", "Trajectories")}>
              <p className="text-center font-mono text-sm text-slate-500">
                Trajectories
              </p>
              <img src="http://localhost:8000/get_trajectories" alt="Video Feed" className="p-2 w-48"></img>
            </Button>
          </div>
        </div>
      </div>
      {isChatOpen && (
        <Chatbot
          onClose={handleChatClosed}
          data={{
            dummyDataAisle,
            sentimentData,
            waitTimeLane,
          }}
        />
      )}
      {openView && (
        <ImageView src={view} als={viewTitle} onClose={() => setOpenView(false)} open={openView} />
      )}

      <div className="h-10"></div>
    </div>
  );
}

