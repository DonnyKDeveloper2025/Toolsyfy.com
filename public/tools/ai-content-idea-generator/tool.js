function initTool() {
    const generateBtn = document.getElementById('generate-btn');
    const topicInput = document.getElementById('topic-input');
    const contentTypeSelect = document.getElementById('content-type-select');
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    const originalBtnContent = generateBtn.innerHTML;

    generateBtn.addEventListener('click', async () => {
        if (window.location.protocol === 'file:') {
            resultOutput.value = "Error: This AI-powered tool requires an internet connection and cannot be run from a local file. Please use it on the hosted website.";
            return;
        }

        const topic = topicInput.value.trim();
        const contentType = contentTypeSelect.value;
        
        if (!topic) {
            alert('Please enter a topic.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.innerHTML = `
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
        `;
        resultOutput.value = 'Generating...';
        copyBtn.classList.add('hidden');

        const prompt = `Generate 5 creative "${contentType}" for the topic: "${topic}". Format the output as a simple, numbered list.`;

        try {
            const apiResponse = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: prompt })
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData.error || `API Error: ${apiResponse.statusText}`);
            }
            
            const { text } = await apiResponse.json();
            resultOutput.value = text.trim();
            copyBtn.classList.remove('hidden');

        } catch (err) {
            console.error('API Error:', err);
            resultOutput.value = `Error: ${err.message || 'Failed to generate content. Please try again later.'}`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = originalBtnContent;
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!resultOutput.value) return;
        navigator.clipboard.writeText(resultOutput.value).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        });
    });
}