/* eslint-disable */

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function getComponents(platform: string) {
  return {
    platform,
    components: [
      { id: "button", name: "Button", props: { color: "blue", text: "Click" } },
      { id: "card", name: "Card", props: { title: "Card", description: "Details" } },
    ],
  };
}

export function updateComponent(componentId: string, updates: any) {
  return `Component ${componentId} updated with ${JSON.stringify(updates)} (mock approval required).`;
}

export async function fetchFigmaFile(fileId: string): Promise<any> {
  try {
    console.log('fetching figma file: ', fileId);
    const response = await axios.get(`${BASE_URL}/api/figma`, {
      params: { fileId }
    });
    return response.data;
  } catch (error) {
    console.error("Figma API Error:", error);
    return { error: `Failed to fetch Figma file. URL: ${process.env.NEXT_PUBLIC_API_URL}, fileId: ${fileId}, error: ${error}` };
  }
}

export async function makeDBOperation(dbCommand: string) {
  console.log('makeDBOperation called with: ', dbCommand);
  try {
    const response = await axios.post(`${BASE_URL}/api/dbCrud`, { dbCommand });
    return response.data;
  } catch (error) {
    console.error("DB Operation Error:", error);
    return { error: `Failed to execute DB operation. Command: ${dbCommand}, error: ${error}` };
  }
}
