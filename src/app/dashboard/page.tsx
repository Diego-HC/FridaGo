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
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center align-middle">
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
            {/* <Formik
              initialValues={{ productName: "", quantity: 1 }}
              onSubmit={async (values) => {
                await mutateAsync({
                  productName: values.productName,
                  quantity: values.quantity,
                });
                await utils.lists.getUsersLists.invalidate();
              }}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <div className="flex justify-center space-x-4">
                    <SelectProduct
                      onChange={(value) => setFieldValue("productName", value)}
                      value={values.productName}
                    />
                    <Field
                      name="quantity"
                      as={Input}
                      type="number"
                      min={1}
                      className="w-1/3"
                    />
                    <Button type="submit">Add</Button>
                  </div>
                </Form>
              )}
            </Formik>
            <div>
              {isLoading ? (
                <Card>
                  <Skeleton className="h-10" />
                </Card>
              ) : (
                data?.map((product) => (
                  <Card
                    key={product.id}
                    className="flex items-center p-4 align-middle"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="mr-4 h-12 w-12 rounded-lg object-cover"
                    />
                    <p className="font-semibold">{product.name}</p>
                  </Card>
                ))
              )}
            </div> */}
          </>
        </CardContent>
      </Card>
    </div>
  );
}
