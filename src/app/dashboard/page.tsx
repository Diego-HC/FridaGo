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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "r/components/ui/select";
import { SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { useRouter } from "next/navigation";

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
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center align-middle">
      <Card className="h-4/5 w-2/3">
        <CardHeader>My list</CardHeader>
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
      <Card className="h-3/5 w-2/3">
        <CardHeader>Assistant</CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === "user" ? "text-right" : "text-left"
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
                { role: "user", content: values.message! },
              ]);
              const res = await processMessag({ message: values.message });
              console.log(res);
              if (
                res?.chatResponse !== undefined &&
                res?.chatResponse !== null &&
                res?.chatResponse !== ""
              ) {
                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: res?.chatResponse! },
                ]);
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
    </div>
  );
}
