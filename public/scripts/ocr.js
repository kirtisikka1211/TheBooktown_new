
document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('book-image');
    const donationForm = document.getElementById('donation-form');

    imageInput.addEventListener('change', async function () {
        const file = imageInput.files[0];
        if (file) {
            const fileSizeMB = file.size / (1024 * 1024);
            const validTypes = ['image/jpeg', 'image/png'];

            if (!validTypes.includes(file.type)) {
                alert('Please upload a JPG or PNG image.');
                imageInput.value = '';
                return;
            }

            if (fileSizeMB > 5) {
                alert('File size must be under 5MB.');
                imageInput.value = '';
                return;
            }

            try {
                const base64Image = await toBase64(file);

                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer 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"
                    },
                    body: JSON.stringify({
                        model: "llava",
                        messages: [
                            {
                                role: "system",
                                content: "You are a helpful assistant that extracts book metadata from a front cover."
                            },
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: "Extract the title, author, genre, and a short 1-2 line summary of the book from the image." },
                                    { type: "image_url", image_url: { url: base64Image } }
                                ]
                            }
                        ],
                        temperature: 0.3
                    })
                });

                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;

                if (content) {
                    const extracted = parseFields(content);
                    if (extracted) {
                        document.getElementById('fullname').value = extracted.title || '';
                        document.getElementById('email').value = extracted.author || '';
                        document.getElementById('username').value = extracted.genre || '';
                        document.getElementById('password').value = extracted.summary || '';
                    }
                }

                donationForm.style.display = 'block';
            } catch (error) {
                console.error('Error processing book image:', error);
                alert('Error processing image. Please fill the form manually.');
                donationForm.style.display = 'block';
            }
        }
    });

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function parseFields(text) {
        const titleMatch = text.match(/title\s*[:\-]\s*(.*)/i);
        const authorMatch = text.match(/author\s*[:\-]\s*(.*)/i);
        const genreMatch = text.match(/genre\s*[:\-]\s*(.*)/i);
        const summaryMatch = text.match(/summary\s*[:\-]\s*(.*)/i);

        return {
            title: titleMatch?.[1]?.trim(),
            author: authorMatch?.[1]?.trim(),
            genre: genreMatch?.[1]?.trim(),
            summary: summaryMatch?.[1]?.trim()
        };
    }
});
