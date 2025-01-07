import { NextResponse } from "next/server";
import axios from "axios";
import { LayoutSchema } from "../../../types/components/layout";
import { GridSchema } from "../../../types/components/grid";
import { CardSchema, CardActionSchema } from "../../../types/components/card";
import { ButtonSchema, ButtonActionSchema } from "../../../types/components/button";

const FIGMA_API_URL = "https://api.figma.com/v1/files";
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_API_KEY;

// Explicit schema mapping
const componentSchemas = {
  Card: {
    schema: CardSchema,
    actionSchema: CardActionSchema
  },
  Button: {
    schema: ButtonSchema,
    actionSchema: ButtonActionSchema
  }
} as const;

// Helper functions for grid calculations
function calculateColStart(x: number, parentBounds: any): number {
  const parentWidth = parentBounds.width;
  const columnWidth = parentWidth / 12;
  return Math.round((x - parentBounds.x) / columnWidth) + 1;
}

function calculateColSpan(width: number, parentBounds: any): number {
  const columnWidth = parentBounds.width / 12;
  return Math.round(width / columnWidth);
}

function calculateRowStart(y: number, parentBounds: any): number {
  const parentHeight = parentBounds.height;
  const approximateRowHeight = parentHeight / 4; // Assuming 4 rows
  return Math.round((y - parentBounds.y) / approximateRowHeight) + 1;
}

async function createComponent(child: any, gridPosition: any) {
  const schemaConfig = componentSchemas[child.name as keyof typeof componentSchemas];
  
  if (!schemaConfig) {
    console.warn(`Schema not found for component: ${child.name}`);
    return null;
  }

  try {
    // First create the action based on component type
    const action = child.name === 'Card' 
      ? {
          type: 'Link',
          variant: 'Default',
          deep_link: child.properties?.deep_link || 'https://www.google.com' // Default link
        }
      : {
          type: 'Button',
          variant: 'Default',
          onClick: child.properties?.onClick || 'https://www.google.com' // Default link for button
        };

    // Validate the action using the appropriate schema
    const validatedAction = schemaConfig.actionSchema.parse(action);

    const baseProps = {
      id: child.id,
      type: child.name,
      variant: 'Default',
      width: child.absoluteBoundingBox?.width || 0,
      height: child.absoluteBoundingBox?.height || 0,
      grid: gridPosition,
      properties: {
        text: child.children?.find(c => c.type === "TEXT")?.characters || "",
        action: validatedAction
      }
    };

    const result = schemaConfig.schema.parse(baseProps);
    console.log(`Successfully created ${child.name} component:`, result);
    return result;

  } catch (error) {
    console.error(`Failed to create component ${child.name}:`, error);
    console.error('Action schema:', schemaConfig.actionSchema);
    console.error('Component schema:', schemaConfig.schema);
    return null;
  }
}

// Fetch Figma file data
async function fetchFigmaFile(fileId: string) {
  console.log('Attempting Figma API call with:', {
    url: `${FIGMA_API_URL}/${fileId}`,
    hasToken: !!FIGMA_ACCESS_TOKEN
  });

  try {
    const response = await axios.get(`${FIGMA_API_URL}/${fileId}`, {
      headers: {
        "X-Figma-Token": FIGMA_ACCESS_TOKEN!,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Figma API call failed:", error);
    throw error;
  }
}

async function traverseNode(node: any) {
  if (!node) return null;

  if (node.type === "DOCUMENT" || node.type === "CANVAS") {
    const children = await Promise.all(node.children?.map(traverseNode) || []);
    return children.filter(Boolean)[0];
  }

  if (node.type === "FRAME" && node.name.includes("Layout")) {
    const rightPanel = node.children?.find((child: any) => child.name === "rightPanel");
    const leftPanel = node.children?.find((child: any) => child.name === "leftPanel");

    // Process all INSTANCE children in rightPanel
    const rightPanelComponents = await Promise.all(
      rightPanel?.children
        ?.filter((child: any) => child.type === "INSTANCE")
        .map(async (child: any) => {
          const gridPosition = GridSchema.parse({
            colStart: calculateColStart(child.absoluteBoundingBox.x, rightPanel.absoluteBoundingBox),
            colSpan: calculateColSpan(child.absoluteBoundingBox.width, rightPanel.absoluteBoundingBox),
            rowStart: calculateRowStart(child.absoluteBoundingBox.y, rightPanel.absoluteBoundingBox)
          });
          
          return createComponent(child, gridPosition);
        }) || []
    );

    return LayoutSchema.parse({
      id: node.id,
      type: 'Layout',
      variant: 'Default',
      width: node.absoluteBoundingBox?.width || 700,
      height: node.absoluteBoundingBox?.height || 475,
      properties: {
        responsive: {
          breakpoint: 768
        },
        backgroundColor: node.backgroundColor
      },
      panels: {
        left: {
          type: 'ImagePanel',
          properties: {
            width: leftPanel?.absoluteBoundingBox?.width || 350,
            height: leftPanel?.absoluteBoundingBox?.height || 475,
            images: {
              desktop: {
                url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
                width: leftPanel?.absoluteBoundingBox?.width || 350,
                height: leftPanel?.absoluteBoundingBox?.height || 475
              },
              tablet: {
                url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
                width: leftPanel?.absoluteBoundingBox?.width || 350,
                height: leftPanel?.absoluteBoundingBox?.height || 475
              },
              mobile: {
                url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
                width: '100%',
                height: 300
              }
            },
            fit: 'cover'
          }
        },
        right: {
          type: 'ContentPanel',
          properties: {
            layout: {
              display: 'grid',
              columns: 12,
              rows: 12,
              width: rightPanel?.absoluteBoundingBox?.width || 350
            }
          },
          children: rightPanelComponents.filter(Boolean)
        }
      }
    });
  }

  return null;
}

// Main handler for the GET request
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fileId = url.searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json(
      { error: "Missing fileId parameter in the request" },
      { status: 400 }
    );
  }

  try {
    console.log("Figma API Key present:", !!process.env.FIGMA_API_KEY);
    console.log("Fetching Figma file with ID:", fileId);

    const figmaData = await fetchFigmaFile(fileId);
    const transformedData = await traverseNode(figmaData.document);
    
    return NextResponse.json(transformedData);
    
  } catch (error: any) {
    console.error("Detailed error in GET route:", error);
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" },
      { status: error.status || 500 }
    );
  }
}
