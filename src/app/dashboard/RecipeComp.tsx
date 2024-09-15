import { Card, CardContent, CardHeader } from "r/components/ui/card";
import { api } from "rbrgs/trpc/react";

export default function RecipeComp({ id }: { id: string }) {
  const { data, isLoading } = api.recipes.getRecipeById.useQuery({ id });
  return (
    <Card className="flex">
      <CardHeader>{isLoading ? "Loading..." : data?.name}</CardHeader>
      <CardContent className="flex">
        {isLoading ? (
          "Loading..."
        ) : (
          <img
            src={data?.image_url!}
            alt={data?.name}
            className="h-32 w-32 object-cover"
          />
        )}
      </CardContent>
    </Card>
  );
}
