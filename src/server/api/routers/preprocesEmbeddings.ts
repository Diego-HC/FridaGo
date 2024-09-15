import OpenAI from "openai";
import { Recepie, Inventory } from "@prisma/client";

import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "rbrgs/server/api/trpc";
import { getEmbedding } from "../common/embeddings/getEmbeddings";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

const client = createClient(
  "https://himztnirqskswoyfyhyh.supabase.co",
  process.env.SUPABASE_ANON_KEY ?? "",
);

const openai = new OpenAI({
  // apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://fridaplatform.com/v1",
});

export function getRecipeStrings(recipe: Recepie) {
  return [recipe.name, ...recipe.Instructions];
}

export function getIngredientStrings(ingredient: Inventory) {
  return [ingredient.name, ingredient.description];
}

export async function registerEmbedding({
  context,
  id,
  AddEmbedding,
}: {
  context: string;
  id: string | number;
  AddEmbedding: (
    id: string | number,
    context: string,
    embedding: number[],
  ) => Promise<void>;
}) {
  const embedding = await getEmbedding(context);
  if (!embedding) {
    return null;
  }
  await AddEmbedding(id, context, embedding);
}

export const embeddingsRouter = createTRPCRouter({
  processAllRecipes: protectedProcedure.mutation(async ({ ctx }) => {
    const recipes = await ctx.db.recepie.findMany({});

    const RecipesToStrings = {} as Record<string, string[]>;
    recipes.forEach((recipe) => {
      RecipesToStrings[recipe.id] = getRecipeStrings(recipe);
    });

    for (const recipe of recipes) {
      const strings = RecipesToStrings[recipe.id];
      if (!strings) {
        continue;
      }
      for (const string of strings) {
        void registerEmbedding({
          context: string,
          id: recipe.id,
          AddEmbedding: async (id, context, embedding) => {
            await ctx.db
              .$queryRaw`INSERT INTO public."VectorStore" ("recepieId", context, vector) VALUES (${id}, ${context}, (${embedding}))`;
          },
        });
      }
    }
    const IngredientsToStrings = {} as Record<string, string[]>;
    const ingredients = await ctx.db.inventory.findMany({});
    ingredients.forEach((ingredient) => {
      IngredientsToStrings[ingredient.id] = getIngredientStrings(ingredient);
    });

    for (const ingredient of ingredients) {
      const strings = IngredientsToStrings[ingredient.id];
      if (!strings) {
        continue;
      }
      for (const string of strings) {
        void registerEmbedding({
          context: string,
          id: ingredient.id,
          AddEmbedding: async (id, context, embedding) => {
            await ctx.db
              .$executeRaw`INSERT INTO public."VectorStore" ("inventoryId", context, vector) VALUES (${id}, ${context}, (${embedding}))`;
          },
        });
      }
    }
  }),
  processMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        previousConversation: z
          .object({
            messages: z.array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string(),
              }),
            ),
          })
          .optional(),
        previousContext: z
          .array(
            z.object({
              similarity: z.number(),
              context: z.string(),
              recepieid: z.string().optional().nullable(),
              inventoryid: z.number().optional().nullable(),
            }),
          )
          .optional()
          .nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const embedding = await getEmbedding(input.message);
      if (!embedding) {
        return null;
      }

      const context = (await client.rpc("similarity_search_vectorstore", {
        embedding,
        match_count: 5,
        min_similarity: 0.3,
      })) as {
        data?: {
          similarity: number;
          context: string;
          recepieid?: string;
          inventoryid?: number;
        }[];
      };
      console.log("context", context);

      // merge contexts
      if (input.previousContext) {
        input.previousContext.forEach((item) => {
          context.data?.push(
            item as {
              similarity: number;
              context: string;
              recepieid: string | undefined;
              inventoryid: number | undefined;
            },
          );
        });
      }

      const uniqueRecepies = new Set<string>();
      const uniqueIngredients = new Set<number>();

      context.data?.forEach((item) => {
        if (item.recepieid) {
          uniqueRecepies.add(item.recepieid);
        } else if (item.inventoryid) {
          uniqueIngredients.add(item.inventoryid);
        }
      });
      const chatResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a smart supermarket assistant, and you will guide the user to find the information about a recipe or ingredient given the messages and the information given. DONT give any recipes or ingredients, give them information based on the given context.",
          },
          {
            role: "system",
            content:
              "Here is some useful information:" +
              Array.from(context.data?.map((val) => val.context) ?? []).join(
                ", ",
              ),
          },
          ...(input?.previousConversation?.messages ?? []),
          {
            role: "user",
            content: input.message,
          },
        ],
      });

      return {
        chatResponse: chatResponse.choices[0]?.message.content,
        context: context.data,
      };
    }),
});

/**
 {
      similarity: 0.323284953832626,
      context: 'Serve the sliced carne asada in warm tortillas with your choice of salsa, cilantro, and lime wedges.',
      recepieid: 'cm13cptut000011mhl2mbdw3q',
      inventoryid: null
    }
create or replace function similarity_search_vectorstore(embedding vector(1536), match_count bigint, min_similarity float)
returns table (similarity float, context text, recepieId string, inventoryId int)
language plpgsql
as $$
begin
return query
select
    (public."VectorStore".vector <#> embedding) * -1 as similarity,
    public."VectorStore".context,
    public."VectorStore".recepieId,
    public."VectorStore".inventoryId,
from public."VectorStore"
where ((public."VectorStore".embd <#> embedding) * -1) >= min_similarity 
order by embd <#> embedding
limit match_count;
end;
$$;

 */
