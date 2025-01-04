import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Note: Remove NEXT_PUBLIC_
});

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an admin assistant for a component management tool. Your job is to interpret admin commands and map them to the appropriate tools. Also answer to genral questions like a chat Assitant",
        },
        { role: "user", content: command },
      ],
    });

    return NextResponse.json({ content: response.choices[0]?.message?.content });
  } catch (error) {
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}