import { NextResponse } from "next/server";
import axios from "axios";

const FIGMA_API_URL = "https://api.figma.com/v1/files";
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_API_KEY;

// Fetch Figma file data
async function fetchFigmaFile(fileId: string) {
  try {
    const response = await axios.get(`${FIGMA_API_URL}/${fileId}`, {
      headers: {
        "X-Figma-Token": FIGMA_ACCESS_TOKEN!,
      },
    });
    return response.data;
  } catch (error) {
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

    // For DOCUMENT and CANVAS nodes, process their children
    if (node.type === "DOCUMENT" || node.type === "CANVAS") {
      return node.children?.length 
        ? traverseNode(node.children[0]) 
        : null;
    }

    // For COMPONENT nodes
    if (node.type === "COMPONENT") {
      const processedNode = {
        id: node.id,
        name: node.name,
        type: node.type,
        width: node.absoluteBoundingBox?.width || null,
        height: node.absoluteBoundingBox?.height || null,
        text: null
      };

      // Process INSTANCE children
      if (node.children) {
        const instances = node.children
          .filter(child => child.type === "INSTANCE")
          .map(child => ({
            id: child.id,
            name: child.name,
            type: child.type,
            width: child.absoluteBoundingBox?.width || null,
            height: child.absoluteBoundingBox?.height || null,
            text: child.children?.find(c => c.type === "TEXT")?.characters?.replace(/\.$/, '') || null
          }));

        if (instances.length > 0) {
          processedNode.children = instances;
        }
      }

      return processedNode;
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
    console.log("Fetching Figma file with ID:", fileId);

    // Step 1: Fetch Figma file data
    const figmaData = await fetchFigmaFile(fileId);

    // Step 2: Traverse the document structure
    const documentDetails = traverseNode(figmaData.document);
    console.log('documentDetails: ', documentDetails);
    // Step 3: Respond with extracted details
    return NextResponse.json(documentDetails);
  } catch (error: any) {
    return NextResponse.json(
      error.error || { error: "An unknown error occurred" },
      { status: error.status || 500 }
    );
  }
}
