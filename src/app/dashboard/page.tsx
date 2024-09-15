"use client";
import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "r/components/ui/card";
import { Form, Formik, Field } from "formik";
import { Input } from "r/components/ui/input";
import { Button } from "r/components/ui/button";
import { api } from "rbrgs/trpc/react";
import { Skeleton } from "r/components/ui/skeleton";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/outline";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "r/components/ui/select";
import { SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { useRouter } from "next/navigation";
import { set } from "zod";
import RecipeComp from "rbrgs/app/dashboard/RecipeComp";
import ItemComp from "rbrgs/app/dashboard/ItemComp";

function SelectProduct({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const { data, isLoading } = api.products.getProducts.useQuery();
  return (
    <Select
      value={value}
      onValueChange={(value) => {
        onChange(value);
      }}
    >
      <SelectTrigger className="w-1/3 rounded-md border-2">
        <SelectValue placeholder="Select a product" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Product</SelectLabel>
          {isLoading ? (
            <option>Loading...</option>
          ) : (
            data?.map((product) => (
              <SelectItem key={product.id} value={product.name}>
                {product.name}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { data, isLoading } = api.products.getProducts.useQuery();
  const { data: lista, isLoading: listLoading } =
    api.lists.getUsersLists.useQuery();
  const { mutateAsync } = api.lists.addItemToList.useMutation();
  const utils = api.useUtils();
  const { mutateAsync: findBestIngredientsMatch } =
    api.recipes.recommendBestIngredients.useMutation();
  const { mutateAsync: clearList } = api.lists.clearItemsList.useMutation();
  const { mutateAsync: deleteItem } = api.lists.deleteItemList.useMutation();
  const [bestIngredients, setBestIngredients] = React.useState<
    | {
      similarity: number;
      name: string;
      description: string;
      location: string;
      image_url: string;
    }[]
    | null
  >(null);

  React.useEffect(() => {
    const fetchBestIngredients = async () => {
      if (lista) {
        const ingredientNames = lista.map((item) => item.item.name);
        const recommendations = await findBestIngredientsMatch({
          ingredients: ingredientNames,
        });
        setBestIngredients(recommendations);
      }
    };

    void fetchBestIngredients();
  }, [lista, findBestIngredientsMatch]);

  const handleClearList = async () => {
    await clearList();
    await utils.lists.getUsersLists.invalidate();
  };

  const handleDeleteItem = async (productName: string, quantity: number) => {
    await deleteItem({
      productName,
      quantity,
    });
    await utils.lists.getUsersLists.invalidate();
  };

  const { mutateAsync: refreshEmbeddings } =
    api.embeddings.processAllRecipes.useMutation();

  const { mutateAsync: processMessag } =
    api.embeddings.processMessage.useMutation();

  const [messages, setMessages] = React.useState<
    {
      role: "user" | "assistant";
      content: string;
    }[]
  >([]);

  const [previousContext, setPreviousContext] = React.useState<
    | {
      similarity: number;
      context: string;
      recepieid?: string | undefined;
      inventoryid?: number | undefined;
    }[]
    | null
  >(null);

  return (
    <div className="bg-slate-50">
      <h2 className="bg-slate-50 ml-12 text-3xl font-semibold text-gray-700">
        Admin Dashboard
      </h2>


      <div className="bg-slate-50 flex gap-8 min-h-[calc(100vh-4rem)] flex-col items-center justify-center align-middle">

        <Card className="h-4/5 w-2/3">
          <CardHeader>
            My list
            <div className="my-4 flex w-full">
              <Button onClick={handleClearList} className="ml-auto">
                Clear list
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <>
              <div className="flex w-full flex-wrap justify-evenly">
                {listLoading ? (
                  <Card>
                    <Skeleton className="h-10" />
                  </Card>
                ) : (
                  lista?.map((product) => (
                    <Card
                      key={product.id}
                      className="flex items-center p-4 align-middle"
                      onClick={() => {
                        void router.push(
                          // {
                          //   pathname: "/navigator",
                          //   query: {
                          //     destination: product.item.id,
                          //     imageUrl: encodeURIComponent(
                          //       product.item.image_url,
                          //     ),
                          //   },
                          // },
                          `/navigator?destination=${product.item.name}&imageUrl=${encodeURIComponent(product.item.image_url)}`,
                        );
                      }}
                    >
                      <img
                        src={product.item.image_url}
                        alt={product.item.name}
                        className="mr-4 h-12 w-12 rounded-lg object-cover"
                      />

                      <p className="mx-8 font-semibold">{product.item.name}</p>
                      <p>{product.quantity}</p>
                      <Button
                        className="bg-white p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteItem(
                            product.item.name,
                            product.quantity,
                          );
                        }}
                      >
                        <TrashIcon className="h-6 w-6 text-black" />
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </>
            <Button
              className="mt-4"
              onClick={async () => {
                await refreshEmbeddings();
              }}
            >
              AddEmbs
            </Button>
          </CardContent>
        </Card>
        <Card className="h-4/5 w-2/3">
          <CardHeader>Recommendations</CardHeader>
          <CardContent>
            <div className="flex w-full flex-wrap justify-evenly">
              {isLoading && bestIngredients === null ? (
                <Card>
                  <Skeleton className="h-10" />
                </Card>
              ) : (
                bestIngredients?.map((product) => (
                  <Card
                    key={product.name}
                    className="flex items-center p-4 align-middle"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="mr-4 h-12 w-12 rounded-lg object-cover"
                    />
                    <p className="font-semibold">{product.name} </p>
                    <p>{product.description}</p>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="h-3/5 w-2/3">
          <CardHeader>Assistant</CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${message.role === "user" ? "text-right" : "text-left"
                    }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
            <Formik
              initialValues={{ message: "", messages: [] }}
              onSubmit={async (values) => {
                if (!values.message || values.message === "") {
                  return;
                }
                setMessages((prev) => [
                  ...prev,
                  { role: "user", content: values.message },
                ]);
                const res = await processMessag({
                  message: values.message,
                  previousContext: previousContext,
                  previousConversation: { messages: messages },
                });
                console.log(res);
                if (res?.chatResponse?.length && res?.chatResponse?.length > 0) {
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: res?.chatResponse ?? "" },
                  ]);
                  if (res?.context) {
                    const seted = new Set<{
                      similarity: number;
                      context: string;
                      recepieid?: string | undefined;
                      inventoryid?: number | undefined;
                    }>();
                    previousContext?.forEach((item) => {
                      seted.add(item);
                    });
                    res.context.forEach((item) => {
                      seted.add(item);
                    });
                    setPreviousContext(Array.from(seted));
                  }
                }
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="flex">
                  <Field
                    name="message"
                    as={Input}
                    placeholder="Ask me anything"
                  />
                  <Button type="submit">Send</Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
        {previousContext && (
          <div className="bg-slate-50 m-2 flex max-w-full flex-wrap">
            <div className="m-2">
              <p>Recomended Recipes</p>
              <div className="flex">
                {
                  //unique recepies by recepieid
                  Array.from(
                    previousContext
                      .filter((item) => item.recepieid !== undefined)
                      .reduce((acc, item) => {
                        if (item.recepieid) {
                          acc.add(item.recepieid);
                        }
                        return acc;
                      }, new Set<string>()),
                  )
                    .slice(0, 5)
                    .map((item) => (
                      <RecipeComp key={item} id={item} />
                    ))
                }
              </div>
            </div>
            <div className="m-2">
              <p>Recomended Products</p>
              <div className="flex">
                {
                  //unique products by inventoryid
                  Array.from(
                    previousContext
                      .filter((item) => item.inventoryid !== undefined)
                      .reduce((acc, item) => {
                        if (item.inventoryid) {
                          acc.add(item.inventoryid);
                        }
                        return acc;
                      }, new Set<number>()),
                  )
                    .slice(0, 5)
                    .map((item) => (
                      <ItemComp key={item} id={item} />
                    ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
