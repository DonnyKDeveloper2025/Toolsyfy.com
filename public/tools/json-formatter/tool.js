function initTool() {
    const formatBtn = document.getElementById('format-btn');
    const minifyBtn = document.getElementById('minify-btn');
    const copyBtn = document.getElementById('copy-btn');
    const jsonInput = document.getElementById('json-input');
    const jsonOutput = document.getElementById('json-output');
    const statusMessage = document.getElementById('status-message');

    function showStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.className = `mt-2 text-sm text-center h-5 ${isError ? 'text-red-500' : 'text-green-500'}`;
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 3000);
    }

    function formatJson() {
        try {
            const jsonObj = JSON.parse(jsonInput.value);
            jsonOutput.value = JSON.stringify(jsonObj, null, 2);
            showStatus('JSON is valid and formatted!', false);
        } catch (e) {
            jsonOutput.value = '';
            showStatus(e.message, true);
        }
    }

    function minifyJson() {
        try {
            const jsonObj = JSON.parse(jsonInput.value);
            jsonOutput.value = JSON.stringify(jsonObj);
            showStatus('JSON is valid and minified!', false);
        } catch (e) {
            jsonOutput.value = '';
            showStatus(e.message, true);
        }
    }

    function copyOutput() {
        if (!jsonOutput.value) {
            showStatus('Nothing to copy.', true);
            return;
        }
        navigator.clipboard.writeText(jsonOutput.value).then(() => {
            showStatus('Copied to clipboard!', false);
        }).catch(() => {
            showStatus('Failed to copy.', true);
        });
    }

    formatBtn.addEventListener('click', formatJson);
    minifyBtn.addEventListener('click', minifyJson);
    copyBtn.addEventListener('click', copyOutput);
    jsonInput.addEventListener('paste', () => setTimeout(formatJson, 50));
}
