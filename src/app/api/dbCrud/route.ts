import { NextResponse } from 'next/server'
import { Client, fql, FaunaError } from 'fauna'
import OpenAI from 'openai'

const client = new Client({
  secret: process.env.FAUNA_DB_SECRET!
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface FilterParams {
  id?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  // ... any other properties your layouts might have
}

const testData = {
  "type": "Layout",
  "variant": "Default",
  "width": 700,
  "height": 475
};

async function createLayout(data: any) {
  try {
    console.log('Using test data:', JSON.stringify(testData, null, 2));

    const documentQuery = fql`
      layoutsWeb.create(${testData}) {
        id,
        ts,
        data
      }
    `;

    console.log('Final query structure:', documentQuery);

    const result = await client.query(documentQuery);
    console.log('Fauna creation result:', result);
    
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('Fauna creation error:', error);
    
    if (error instanceof FaunaError) {
      console.error('FaunaError details:', {
        message: error.message
      });
    }

    return {
      error: 'Failed to create layout',
      details: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown Error'
    };
  }
}

// Unified Read with filters
async function getLayouts() {
  try {
    const result = await client.query(fql`
      layoutsWeb.all() {
        id,
        ts,
        data
      }
    `)
    return { data: result }
  } catch (error) {
    console.error('Fauna fetch error:', error);
    return { error: 'Failed to fetch layouts' }
  }
}

// Update
async function updateLayout(id: string, data: any) {
  try {
    const result = await client.query(fql`
      Update(
        Document("layoutsWeb", ${id}),
        { data: ${data} }
      )
    `)
    return { success: true, data: result }
  } catch (error) {
    return { error: 'Failed to update layout' }
  }
}

// Delete
async function deleteLayout(id: string) {
  try {
    const result = await client.query(fql`
      Delete(Document("layoutsWeb", ${id}))
    `)
    return { success: true, data: result }
  } catch (error) {
    return { error: 'Failed to delete layout' }
  }
}

// HTTP route handler
export async function POST(request: Request) {
  try {
    // Log environment variables (mask sensitive parts)
    console.log('Environment Check:', {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasFaunaSecret: !!process.env.FAUNA_DB_SECRET,
      baseUrl: process.env.BASE_URL
    })

    const { dbCommand } = await request.json()
    console.log('Received DB Command:', dbCommand)
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a database operation interpreter. Given a command in natural language:
          1. Identify which function should be called from:
             - createLayout(data: any)
             - getLayouts(filters: FilterParams where filters can include: id, type, status, startDate, endDate)
             - updateLayout(id: string, data: any)
             - deleteLayout(id: string)
          
          2. Extract relevant parameters from the command that match the function's requirements.

          Return strictly a JSON object with:
          {
            "operation": "one of the function names above",
            "params": "parameters extracted from command matching the function's parameters"
          }

          Example 1:
          Command: "get all layouts with status active"
          Response: {
            "operation": "getLayouts",
            "params": { "status": "active" }
          }

          Example 2:
          Command: "update layout with id 123 to status inactive"
          Response: {
            "operation": "updateLayout",
            "params": {
              "id": "123",
              "data": { "status": "inactive" }
            }
          }`
        },
        {
          role: "user",
          content: dbCommand
        }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" }
    })

    const gptResponse = completion.choices[0].message.content
    console.log('GPT Response:', gptResponse)

    const { operation, params } = JSON.parse(gptResponse || '{}')
    console.log('Parsed Operation:', operation)
    console.log('Parsed Params:', params)
    
    const operations = {
      createLayout: (data: any) => createLayout(data),
      // @ts-ignore
      getLayouts: (filters: FilterParams) => getLayouts(filters),
      updateLayout: (params: { id: string, data: any }) => updateLayout(params.id, params.data),
      deleteLayout: (params: { id: string }) => deleteLayout(params.id)
    } as const

    if (operation in operations) {
      console.log('Executing operation:', operation)
      const result = await operations[operation as keyof typeof operations](params)
      console.log('Operation result:', result)
      return NextResponse.json(result)
    }

    console.log('Invalid operation:', operation)
    return NextResponse.json({ error: 'Invalid operation interpreted' }, { status: 400 })
  } catch (error) {
    console.error('Error in POST handler:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ error: 'Failed to process command' }, { status: 500 })
  }
}
