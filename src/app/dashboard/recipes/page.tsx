"use client";
import React, { useState } from "react";
import { api } from "rbrgs/trpc/react";
import { Card, CardContent, CardHeader } from "r/components/ui/card";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { set, z } from "zod";
import { Button } from "r/components/ui/button";
import { Input } from "r/components/ui/input";
import { Star, ShoppingBasket, StarOff, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import { Field, Form, Formik } from "formik";
import { Separator } from "r/components/ui/separator";

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
    image_url?: string;
    Users?: { email: string }[];
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

  const { mutate: likeRecipe } = api.recipes.userLikedRecipe.useMutation();

  const { mutate: dislikeRecipe } = api.recipes.userUnLikedRecipe.useMutation();

  const { data: session } = useSession();

  const { mutateAsync: addToCart } = api.lists.addItemsToList.useMutation();

  const utils = api.useUtils();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-6">
      {isRecepiesLoading && <p>Loading Recepies...</p>}
      {recepies && (
        <div className="flex w-5/6 scroll-my-2 space-x-12 overflow-auto">
          {recepies.map((recepie) => (
            <Card
              key={recepie.id}
              className="flex w-max flex-col items-center justify-center pt-6"
            >
              <CardContent className="flex flex-col items-center justify-center">
                <img
                  src={recepie.image_url ?? ""}
                  alt={recepie.name}
                  className="max-h-48 min-h-48 min-w-48 max-w-48 rounded-lg border-2 border-gray-200 object-cover shadow-md"
                />
                <p>{recepie.name}</p>
                <div className="-ml-10 flex w-36 justify-between space-x-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      if (!session) {
                        return;
                      }
                      if (recepie.Users?.length == 0) {
                        likeRecipe({ id: recepie.id });
                        recepie.Users?.push({
                          email: session.user?.email as string | null,
                          id: session.user?.id,
                          name: session.user?.name as string | null,
                          image: session.user?.image as string | null,
                          role: "user",
                          emailVerified: new Date(),
                        });
                      } else {
                        dislikeRecipe({ id: recepie.id });
                        recepie.Users?.pop();
                      }
                    }}
                  >
                    {recepie.Users?.length == 0 ? (
                      <Star className="h-6 w-6" />
                    ) : (
                      <StarOff className="h-6 w-6" fill="yellow" />
                    )}
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setRecipe({
                        title: recepie.name,
                        ingredients: recepie.Ingredients?.map((ing) => {
                          return {
                            id: ing.id,
                            name: ing.name,
                            description: ing.description,
                            image_url: ing.image_url,
                          };
                        }),
                        instructions: recepie.Instructions ?? [],
                      });
                      setRecipeUrl(recepie.image_url);
                    }}
                  >
                    <ExternalLink className="h-6 w-6" />
                  </Button>
                  <Button
                    onClick={async () => {
                      await addToCart({
                        items: recepie.Ingredients?.map((ing) => {
                          return {
                            productName: ing.name,
                            description: ing.description,
                            image_url: ing.image_url,
                          };
                        }),
                      });
                      await utils.lists.getUsersLists.invalidate();
                    }}
                  >
                    <ShoppingBasket className="h-6 w-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Separator className="m-4 w-9/12" />
      <Formik
        initialValues={{
          prompt: "",
        }}
        onSubmit={async (values) => {
          setRecepieLoading(true);
          const res = await createRecipeMut({ prompt: values.prompt });
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
        className="flex w-full justify-center"
      >
        <Form className="flex w-full items-center justify-center align-middle">
          <Field
            name="prompt"
            as={Input}
            placeholder="Need some inspiration? How about a 'Healthy breakfast'"
            // onChange={(e) => setPrompt(e.target.value ?? "")}
            className="m-4 w-1/2 border-none shadow-xl"
          />
          <Button type="submit" className="m-4 shadow-xl">
            Create Recipe
          </Button>
        </Form>
      </Formik>

      {recepieLoading && <p>Loading Recipe...</p>}
      {recipe && (
        <Card className="w-3/4">
          <CardHeader>
            <div className="flex w-full justify-between">
              <p className="text-xl font-bold">{recipe.title}</p>
              <div className="flex space-x-4">
                <Button variant={"outline"}>
                  {recipe.Users?.length == 0 ? (
                    <Star className="h-6 w-6" />
                  ) : (
                    <StarOff className="h-6 w-6" fill="yellow" />
                  )}
                </Button>
                <Button>
                  <ShoppingBasket className="h-6 w-6" />
                </Button>
                <Button
                  onClick={() => {
                    setRecipe(null);
                    setRecipeUrl(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="">
            <div className="flex space-x-2">
              <div>
                <img
                  src={recipeUrl!}
                  alt={recipe.title}
                  className="h-48 w-48"
                />
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
