import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "rbrgs/server/api/trpc";

export const listsRouter = createTRPCRouter({
  getUsersLists: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.userList.findMany({
      where: { userId: ctx.session.user.id },
      include: { item: true },
    });
  }),
  addItemToList: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.userList.findFirst({
        where: {
          userId: ctx.session.user.id,
          inventoryName: input.productName,
        },
      });
      if (list) {
        return await ctx.db.userList.update({
          where: { id: list.id },
          data: { quantity: list.quantity + input.quantity },
        });
      }
      return await ctx.db.userList.create({
        data: {
          userId: ctx.session.user.id,
          quantity: input.quantity,
          inventoryName: input.productName,
        },
      });
    }),
  updateListing: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.userList.update({
        where: { id: input.id, userId: ctx.session.user.id },
        data: { quantity: input.quantity },
      });
    }),
});
