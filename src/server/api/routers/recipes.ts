import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "rbrgs/server/api/trpc";
import OpenAI from "openai";
import { Inventory, Recepie } from "@prisma/client";
import { getEmbedding } from "../common/embeddings/getEmbeddings";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { Sql } from "@prisma/client/runtime/library";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const client = createClient(
  "https://himztnirqskswoyfyhyh.supabase.co",
  process.env.SUPABASE_ANON_KEY ?? "",
);
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

async function createNewRecepie(prompt: string) {
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
        content: prompt,
      },
    ],
  });
  console.log(res);
  if (res.choices[0]?.message.content) {
    return zodResponseForm.$parseRaw(res.choices[0]?.message.content);
  }
  return null;
}
/**


drop function if exists similarity_search_inventory (embedding vector (1536), match_count bigint);

create or replace function similarity_search_inventory(embedding vector(1536), match_count bigint, min_similarity float)
returns table (similarity float, name text, description text, location text, image_url text)
language plpgsql
as $$
begin
return query
select
    (public."Inventory".embd <#> embedding) * -1 as similarity,
    public."Inventory".name,
    public."Inventory".description,
    public."Inventory".location,
    public."Inventory".image_url
from public."Inventory"
where ((public."Inventory".embd <#> embedding) * -1) >= min_similarity 
order by embd <#> embedding
limit match_count;
end;
$$;

GRANT EXECUTE ON FUNCTION similarity_search_inventory(vector, bigint) TO public;
GRANT SELECT ON TABLE public."Inventory" TO public;
    */

export const recipesRouter = createTRPCRouter({
  createRecipeFromPrompt: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const recipe = await createNewRecepie(input.prompt);
      if (!recipe) {
        return null;
      }

      const actualIngredients = recipe.ingredients.map(async (ingredient) => {
        console.log("INGREDIENT", ingredient);
        const embd = await getEmbedding(ingredient);
        if (!embd) {
          return null;
        }
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
          return null;
        }

        const res = (await client.rpc("similarity_search_inventory", {
          embedding: embd,
          match_count: 1,
          min_similarity: 0.4,
        })) as {
          data: {
            similarity: number;
            name: string;
            description: string;
            location: string;
            image_url: string;
          }[];
        };
        const actualInstructions = res.data
          .map((ingredient) => {
            if (!ingredient) {
              return null;
            }
            return ingredient;
          })
          .filter((ingredient) => ingredient !== null);
        console.log("actualInstructions", actualInstructions);
        return actualInstructions[0];
        //   return actualInstructions;
      });

      const img = await getImage({ query: recipe.title });

      const ings = (await Promise.all(actualIngredients)).filter(
        (ing) => ing !== null && ing !== undefined,
      );
      console.log("actualIngredients", actualIngredients);

      const res = await ctx.db.recepie.create({
        data: {
          description: recipe.title,
          name: recipe.title,
          Ingredients: {
            connect: ings.map((ing) => {
              return {
                name: ing?.name,
              };
            }),
          },
          Instructions: recipe.instructions,
          image_url: img,
        },
        include: {
          Ingredients: true,
        },
      });
      return res;
    }),
  findRecepieByPrompt: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const embedding = await getEmbedding(input.prompt);
      if (!embedding) {
        return null;
      }
      //Todo
    }),
  getRecipes: publicProcedure.query(async ({ ctx }) => {
    const recipes = await ctx.db.recepie.findMany({
      include: {
        Ingredients: true,
        Users: {
          where: {
            id: { equals: ctx.session?.user.id },
          },
        },
      },
    });
    return recipes;
  }),
  userLikedRecipe: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db.recepie.update({
        where: { id: input.id },
        data: {
          Users: {
            connect: {
              id: ctx.session?.user.id,
            },
          },
        },
      });
      return res;
    }),
  userUnLikedRecipe: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db.recepie.update({
        where: { id: input.id },
        data: {
          Users: {
            disconnect: {
              id: ctx.session?.user.id,
            },
          },
        },
      });
      return res;
    }),
});
