import OpenAI from "openai";
import { z } from "zod";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export async function getEmbedding(input: string) {
  const res = await openai.embeddings.create({
    input,
    model: "text-embedding-3-large",
    dimensions: 1536,
  });
  return res.data[0]?.embedding ?? null;
}
