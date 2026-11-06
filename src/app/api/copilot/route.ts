import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Add OPENAI_API_KEY to .env.local to enable the design copilot." }, { status: 503 });
  try {
    const { question, design } = await request.json();
    if (typeof question !== "string" || question.trim().length < 2 || question.length > 1200) {
      return NextResponse.json({ error: "Enter a question between 2 and 1,200 characters." }, { status: 400 });
    }
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: "You are the Surrogate Lab engineering copilot. Help users reason about bracket design and stress trends. Be concise and explain uncertainty. This demo uses an illustrative analytic field, not validated finite element analysis. Never claim a design is safe to manufacture; recommend validation with FEA and applicable engineering standards.",
      input: `Current design settings: ${JSON.stringify(design)}\n\nQuestion: ${question.trim()}`,
      max_output_tokens: 350,
    });
    return NextResponse.json({ answer: response.output_text });
  } catch {
    return NextResponse.json({ error: "The copilot could not complete that request. Check the server API key and try again." }, { status: 502 });
  }
}
