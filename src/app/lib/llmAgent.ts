export async function getLLMResponse(command: string) {
    const response = await fetch('/api/initiateLLM', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
    });

    const data = await response.json();
    return data.content || "No response from LLM.";
}