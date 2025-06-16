const GROQ_API_KEY = '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';

async function generateSummary(bookDetails) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "deepseek-r1-distill-llama-70b",
                messages: [
                    {
                        role: "user",
                        content: `Generate a concise book summary based on these details:\nTitle: ${bookDetails.title}\nAuthor: ${bookDetails.author}\nGenre: ${bookDetails.genre}\n\nPlease provide a brief, engaging summary that captures the essence of the book.`
                    }
                ],
                temperature: 0.6,
                max_tokens: 4096,
                top_p: 0.95,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate summary');
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
}

// Export the function
window.generateSummary = generateSummary; 