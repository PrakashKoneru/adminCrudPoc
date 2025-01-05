import { NextResponse } from "next/server";
import axios from "axios";
import { ButtonSchema, CardSchema, LayoutSchema } from '@/types';

// Add debug logging
console.log('Imported schemas:', {
  hasButtonSchema: !!ButtonSchema,
  hasCardSchema: !!CardSchema,
  hasLayoutSchema: !!LayoutSchema,
  layoutSchema: LayoutSchema
});

const FIGMA_API_URL = "https://api.figma.com/v1/files";
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_API_KEY;

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
    throw handleFigmaError(error);
  }
}

// Handle Figma API errors
function handleFigmaError(error: any) {
  console.error("Figma API error:", error);
  if (axios.isAxiosError(error)) {
    return {
      error: error.response?.data || "Failed to fetch Figma data",
      status: error.response?.status || 500,
    };
  }
  return { error: "Unknown error occurred", status: 500 };
}

// Traverse the document and extract details
function traverseNode(node: any) {
    if (!node) return null;

    // Handle DOCUMENT and CANVAS nodes
    if (node.type === "DOCUMENT" || node.type === "CANVAS") {
      return node.children?.length 
        ? traverseNode(node.children[0]) 
        : null;
    }

    // Handle main COMPONENT (Layout)
    if (node.type === "COMPONENT") {
      // Get all components and their positions
      const components = node.children
        ?.filter(child => child.type === "INSTANCE" || child.type === "COMPONENT")
        .sort((a, b) => {
          const yDiff = (a.absoluteBoundingBox?.y || 0) - (b.absoluteBoundingBox?.y || 0);
          return yDiff === 0 
            ? (a.absoluteBoundingBox?.x || 0) - (b.absoluteBoundingBox?.x || 0)
            : yDiff;
        })
        .map(child => ({
          id: child.id,
          type: child.name.split('/')[0],
          variant: child.componentProperties?.variant || 'Default',
          width: child.absoluteBoundingBox?.width || null,
          height: child.absoluteBoundingBox?.height || null,
          properties: {
            text: child.children?.find(c => c.type === "TEXT")?.characters || "",
            action: {
              type: 'Link',
              variant: child.componentProperties?.actionVariant || 'Default',
              deep_link: `settings?modal=${child.name.toLowerCase()}`
            }
          }
        }));

      return LayoutSchema.parse({
        id: node.id,
        type: 'Layout',
        variant: node.componentProperties?.variant || 'Default',
        properties: {
          responsive: {
            breakpoint: 768,
            mobileLayout: 'stacked',
          },
          backgroundColor: node.backgroundColor || { r: 1, g: 1, b: 1, a: 1 },
        },
        panels: {
          left: {
            type: 'ImagePanel',
            properties: {
              imageUrl: 'https://dummyimage.com/600x400/000/fff',
              width: 0,
              height: 600,
              fit: 'cover',
            },
          },
          right: {
            type: 'ContentPanel',
            properties: {
              layout: 'stack',
              gap: 16,
              padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              },
              alignment: 'start',
              direction: 'vertical',
            },
            children: components,
          },
        },
      });
    }

    return null;
}
  
  // Wrapper function to handle layouts and maintain component order
  function traverseLayout(node: any): any {
    if (!node.children) {
      return [];
    }
  
    return node.children
      .map((child: any) => traverseNode(child)) // Traverse each child node
      .filter((child: any) => child !== null); // Exclude null nodes
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
    console.log("Figma API Key present:", !!process.env.FIGMA_API_KEY);  // Check if key exists
    console.log("Fetching Figma file with ID:", fileId);

    const figmaData = await fetchFigmaFile(fileId);
    const documentDetails = traverseNode(figmaData.document);
    
    return NextResponse.json(documentDetails);
  } catch (error: any) {
    console.error("Detailed error in GET route:", error);  // Add detailed error logging
    return NextResponse.json(
      { error: error.message || "An unknown error occurred" },
      { status: error.status || 500 }
    );
  }
}
