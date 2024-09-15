"use client";
import React, { useState } from "react";
import { api } from "rbrgs/trpc/react";
import { Card, CardContent, CardHeader } from "r/components/ui/card";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { Button } from "r/components/ui/button";
import { Input } from "r/components/ui/input";

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
  const [recipe, setRecipe] = useState<{
    title: string;
    ingredients: {
      id: number;
      name: string;
      description: string;
      image_url: string;
    }[];
    instructions: string[];
  } | null>(null);

  const [recipeUrl, setRecipeUrl] = useState<string | null>(null);
  // const { mutate: mut } =
  //   api.products.refreshAllProductEmbeddings.useMutation();
  const { mutateAsync: createRecipeMut } =
    api.recipes.createRecipeFromPrompt.useMutation();
  const [prompt, setPrompt] = useState<string>("");

  const [recepieLoading, setRecepieLoading] = useState<boolean>(false);

  const { data: recepies, isLoading: isRecepiesLoading } =
    api.recipes.getRecipes.useQuery();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-6">
      {isRecepiesLoading && <p>Loading Recepies...</p>}
      {recepies && (
        <div>
          {recepies.map((recepie) => (
            <p key={recepie.id}>{recepie.name}</p>
          ))}
        </div>
      )}
      <Card className="w-1/5 pt-6">
        <CardContent>
          <Input
            placeholder="Prompt"
            onChange={(e) => setPrompt(e.target.value ?? "")}
          />
          {/* <Button
            onClick={async () => {
              console.log("Unsafe");
              mut();
            }}
          >
            Unsafe
          </Button> */}

          {/* <Button
            onClick={async () => {
              console.log("Unsafe");
              mut2({ prompt: "I want to make a carne asada" });
            }}
          >
            carnita
          </Button> */}
          <Button
            onClick={async () => {
              setRecepieLoading(true);
              const res = await createRecipeMut({ prompt: prompt });
              if (!res) {
                return;
              }
              if (!res.image_url) {
                const imageUrl = await getImage({ query: res?.name ?? "" });
                setRecipeUrl(imageUrl);
              } else {
                setRecipeUrl(res.image_url);
              }
              // const imageUrl = await getImage({ query: res?.name ?? "" });
              setRecipe({
                title: res?.name ?? "",
                ingredients: res?.Ingredients?.map((ing) => {
                  return {
                    id: ing.id,
                    name: ing.name,
                    description: ing.description,
                    image_url: ing.image_url,
                  };
                }),
                instructions: res?.Instructions ?? [],
              });
              setRecepieLoading(false);
            }}
          >
            Create Recipe
          </Button>
        </CardContent>
      </Card>
      {recipe && (
        <Card className="w-3/4">
          <CardHeader>
            <p className="text-xl font-bold">{recipe.title}</p>
          </CardHeader>
          <CardContent className="">
            <div className="flex space-x-2">
              <div>
                <img src={recipeUrl} alt={recipe.title} className="h-48 w-48" />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-semibold">Ingredients:</p>
                <ul className="flex max-h-72 w-full flex-col overflow-auto">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="flex space-x-2">
                      <Card className="flex w-full flex-col">
                        <CardHeader>{ingredient.name}</CardHeader>
                        <CardContent className="flex w-full">
                          <div className="flex justify-center">
                            <img
                              src={ingredient.image_url}
                              alt={ingredient.name}
                              className="h-10 w-10 object-cover"
                            />
                            <p>{ingredient.description}</p>
                          </div>
                        </CardContent>
                      </Card>
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
