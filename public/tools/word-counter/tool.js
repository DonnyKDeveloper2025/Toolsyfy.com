function initTool() {
    const textInput = document.getElementById('text-input');
    const wordCountEl = document.getElementById('word-count');
    const charCountEl = document.getElementById('char-count');
    const sentenceCountEl = document.getElementById('sentence-count');
    const paragraphCountEl = document.getElementById('paragraph-count');

    function updateCounts() {
        const text = textInput.value;

        // Character count
        charCountEl.textContent = text.length;

        // Word count
        const words = text.trim().match(/\S+/g);
        wordCountEl.textContent = words ? words.length : 0;
        
        // Sentence count
        const sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
        sentenceCountEl.textContent = sentences ? sentences.length : 0;

        // Paragraph count
        const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '');
        paragraphCountEl.textContent = paragraphs.length > 0 ? paragraphs.length : (text.trim() ? 1 : 0);
    }

    textInput.addEventListener('input', updateCounts);

    // Initial count
    updateCounts();
}
