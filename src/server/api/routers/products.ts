import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "rbrgs/server/api/trpc";
import OpenAI from "openai";
import { Inventory } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function ingredientInputString(ingredient: Inventory) {
  return `${ingredient.name} ${ingredient.description}`;
}

export const productsRouter = createTRPCRouter({
  getProducts: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.inventory.findMany();
    return products;
  }),
  // addProductEmbedding: protectedProcedure
  //   .input(
  //     z.object({
  //       id: z.number().nonnegative(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const product = await ctx.db.inventory.findUnique({
  //       where: { id: input.id },
  //     });
  //     if (!product) {
  //       return null;
  //     }
  //     const embedding = await openai.embeddings.create({
  //       input: ingredientInputString(product),
  //       model: "text-embedding-3-large",
  //       dimensions: 1536,
  //     });
  //     const res = await ctx.db
  //       .$executeRaw`INSERT INTO inventory (embd) VALUES (${embedding.data[0]?.embedding}) WHERE id = ${product.id}`;
  //     return res;
  //   }),
  refreshAllProductEmbeddings: protectedProcedure.mutation(async ({ ctx }) => {
    const products = await ctx.db.inventory.findMany();
    for (const product of products) {
      const embedding = await openai.embeddings.create({
        input: ingredientInputString(product),
        model: "text-embedding-3-large",
        dimensions: 1536,
      });
      await ctx.db
        .$executeRaw`UPDATE public."Inventory" SET embd = (${embedding.data[0]?.embedding}) WHERE id = ${product.id}`;
    }
    return products;
  }),
});
