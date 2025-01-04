import axios from 'axios';

export async function getLLMResponse(command: string) {
    try {
        const response = await axios.post('/api/initiateLLM', {
            command
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('LLM Response:', response.data);
        
        // Check if we have a toolResponse in the API response
        if (response.data.toolResponse) {
            return response.data.toolResponse;
        }
        
        // Handle error cases
        if (response.data.error) {
            throw new Error(response.data.error);
        }
        
        return "No valid response received";
    } catch (error) {
        console.error('Error in getLLMResponse:', error);
        throw error;
    }
}