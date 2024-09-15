"use client";
import React, { useState } from "react";
import { api } from "rbrgs/trpc/react";
import { Card, CardContent, CardHeader } from "r/components/ui/card";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Button } from "r/components/ui/button";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ResponseSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
});
const zodResponseForm = zodResponseFormat(ResponseSchema, "recipe");
const endpoint = "https://api.bing.microsoft.com/v7.0/images/search";

async function getImage({ query }: { query: string }) {
  const res = await fetch(`${endpoint}?q=${query}&count=1`, {
    headers: {
      "Ocp-Apim-Subscription-Key": "6081c9fff16b4c339cf8656656eb40eb",
    },
  });
  const json = (await res.json()) as { value: { contentUrl: string }[] };
  if (res.ok && json?.value[0]?.contentUrl) {
    return json.value[0].contentUrl;
  }
  // return json;
  return null;
}

async function getRecepie({ input }: { input: string }) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: zodResponseForm,
    messages: [
      {
        role: "system",
        content: "You are a recipe creating assistant.",
      },
      {
        role: "user",
        content: input,
      },
    ],
  });
  console.log(res);
  if (res.choices[0]?.message.content) {
    return zodResponseForm.$parseRaw(res.choices[0]?.message.content);
  }
  return null;
}

export default function Recepies() {
  const [recipe, setRecipe] = useState<
    (typeof ResponseSchema)["_output"] | null
  >(null);

  const [recipeUrl, setRecipeUrl] = useState<string | null>(null);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center align-middle">
      <Card className="w-1/5">
        <CardHeader>My list</CardHeader>
        <CardContent>
          <p>Hola</p>
          <Button
            onClick={async () => {
              const res = await getRecepie({
                input: "I want to make a carne asada",
              });
              const imageUrl = await getImage({ query: res?.title ?? "" });
              setRecipeUrl(imageUrl);
              console.log(res);
              setRecipe(res);
            }}
          >
            Gen Recipe
          </Button>
        </CardContent>
      </Card>
      {recipe && (
        <Card className="">
          <CardHeader>
            <p className="text-xl font-bold">{recipe.title}</p>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div>
                <img
                  src={recipeUrl!}
                  alt={recipe.title}
                  className="h-48 w-48"
                />
              </div>
              <div>
                <p className="text-lg font-semibold">Ingredients:</p>
                <ul>
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient} className="flex space-x-2">
                      <p className="text-sm font-bold">-</p>
                      <p>{ingredient}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-lg font-semibold">Instructions:</p>
            <ol>
              {recipe.instructions.map((instruction) => (
                <li key={instruction} className="flex space-x-2">
                  <p className="text-sm font-bold">-</p>
                  <p>{instruction}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
