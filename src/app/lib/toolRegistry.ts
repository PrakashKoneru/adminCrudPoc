/* eslint-disable */

import { getComponents, updateComponent, fetchFigmaFile } from "./tools";

export const toolRegistry: { [key: string]: (args: any) => Promise<any> | any } = {
  "get components": async ({ platform }: { platform: string }) => getComponents(platform),
  "update component": async ({ componentId, updates }: { componentId: string; updates: any }) =>
    updateComponent(componentId, updates),
  "fetch figma file": async ({ fileId }: { fileId: string }) => fetchFigmaFile(fileId),
};

export async function mapAndExecuteTool(command: string, extractedParams: any) {
  const toolKey = Object.keys(toolRegistry).find((key) => command.toLowerCase().includes(key));
  if (!toolKey) {
    return { error: "No matching tool found for the given command." };
  }

  const tool = toolRegistry[toolKey];
  try {
    return await tool(extractedParams);
  } catch (error) {
    return { error: `Error executing tool: ${toolKey}`, details: error.message };
  }
}
