import OpenAI from "openai";
import { NextResponse } from "next/server";
import { mapAndExecuteTool } from "../../lib/toolRegistry"; // Tool registry integration

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { command } = await req.json();

    const prompt = `
      You are an intelligent assistant for an admin tool. Your task is to interpret user commands, select the right tool, extract parameters, and return the tool's response.
      
      Tools available:
      1. "get components": Fetches component details for a platform (e.g., "ios").
      2. "update component": Updates a specific component with provided updates.
      3. "fetch figma file": Fetches data from a Figma file using its file ID.

      Guidelines:
      - Always extract parameters like "fileId", "platform", or "componentId" from the command.
      - If the command matches a tool, respond in JSON format:
        {
          "tool": "name of the tool",
          "params": {
            "key1": "value1",
            "key2": "value2"
          }
        }
      - Be liberal in matching variations of the command.
      - If the command is unclear, ask the user for clarification in one short sentence.

      Examples:
      - Command: "Fetch components for iOS"
        Response: {
          "tool": "get components",
          "params": { "platform": "ios" }
        }
      - Command: "Fetch from Figma file fsgLqRIWFbsmUZDiT8DmlD"
        Response: {
          "tool": "fetch figma file",
          "params": { "fileId": "fsgLqRIWFbsmUZDiT8DmlD" }
        }
      - Command: "Update the button with text Submit"
        Response: {
          "tool": "update component",
          "params": { "componentId": "button", "updates": { "text": "Submit" } }
        }

      Analyze the following command and respond accordingly:
      Command: "${command}"
    `;

    // Step 1: Get tool and parameters using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: command },
      ],
    });

    const content = response.choices[0]?.message?.content;
    console.log('Extracted content from Prompt: ', content);
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // Step 2: Parse the AI response
    const { tool, params } = JSON.parse(content);
    console.log('Extracted tool from prompt: ', tool);

    // Step 3: If no tool is matched, return an error
    if (!tool) {
      return NextResponse.json({ error: "No tool matched the command" });
    }

    // Step 4: Execute the identified tool
    const toolResponse = await mapAndExecuteTool(tool, params);
    console.log('toolResponse after mapping and execution: ', toolResponse);
    // Step 5: Return the tool's response
    return NextResponse.json({ toolResponse });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}
