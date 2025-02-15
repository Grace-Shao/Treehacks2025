export async function generateGeminiResponse(prompt: string) {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}
