function initTool() {
    const markdownInput = document.getElementById('markdown-input');
    const htmlPreview = document.getElementById('html-preview');

    const sampleMarkdown = `# Welcome to the Markdown Editor!
## Write on the left, see the result on the right.

- **Bold** and *italic* text
- \`inline code\`
- [Links](https://www.toolsyfy.com)

\`\`\`javascript
// Code blocks
function helloWorld() {
  console.log("Hello, world!");
}
\`\`\`

> Blockquotes are also supported.
`;

    function updatePreview() {
        const rawMarkdown = markdownInput.value;
        // Sanitize the HTML output to prevent XSS attacks
        const cleanHtml = DOMPurify.sanitize(window.marked.parse(rawMarkdown, { breaks: true }));
        htmlPreview.innerHTML = cleanHtml;
    }

    markdownInput.value = sampleMarkdown;
    updatePreview();

    markdownInput.addEventListener('input', updatePreview);
}
