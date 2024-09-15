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
  deleteItemList: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.quantity - 1 <= 0) {
        return await ctx.db.userList.deleteMany({
          where: {
            userId: ctx.session.user.id,
            inventoryName: input.productName,
          },
        });
      }

      const list = await ctx.db.userList.findFirst({
        where: {
          userId: ctx.session.user.id,
          inventoryName: input.productName,
        },
      });

      if (list) {
        return await ctx.db.userList.update({
          where: { id: list.id },
          data: { quantity: list.quantity - 1 },
        });
      }
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
  clearItemsList: protectedProcedure.mutation(async ({ ctx }) => {
    return await ctx.db.userList.deleteMany({
      where: { userId: ctx.session.user.id },
    });
  }),
  addItemsToList: protectedProcedure
    .input(
      z.object({
        items: z.array(z.object({ productName: z.string() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const usersLists = await ctx.db.userList.findMany({
        where: { userId: ctx.session.user.id },
      });
      const items = input.items;
      const updatedLists = usersLists.map((list) => {
        const item = items.find(
          (item) => item.productName === list.inventoryName,
        );
        if (item) {
          return {
            ...list,
            quantity: list.quantity + 1,
          };
        }
        return list;
      });
      const newItems = items.filter(
        (item) =>
          !usersLists.find((list) => list.inventoryName === item.productName),
      );
      await Promise.all([
        ctx.db.userList.createMany({
          data: newItems.map((item) => ({
            userId: ctx.session.user.id,
            inventoryName: item.productName,
            quantity: 1,
          })),
        }),
        ctx.db.userList.updateMany({
          where: {
            AND: {
              userId: ctx.session.user.id,
              AND: {
                inventoryName: {
                  in: updatedLists.map((list) => list.inventoryName),
                  notIn: newItems.map((item) => item.productName),
                },
              },
            },
          },
          data: {
            quantity: {
              increment: 1,
            },
          },
        }),
      ]);
    }),
});
