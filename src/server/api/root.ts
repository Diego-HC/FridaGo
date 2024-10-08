import { postRouter } from "rbrgs/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "rbrgs/server/api/trpc";
import { productsRouter } from "./routers/products";
import { listsRouter } from "./routers/lists";
import { recipesRouter } from "./routers/recipes";
import { embeddingsRouter } from "./routers/preprocesEmbeddings";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  products: productsRouter,
  lists: listsRouter,
  recipes: recipesRouter,
  embeddings: embeddingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
