function initTool() {
    const generateBtn = document.getElementById('generate-btn');
    const contentInput = document.getElementById('qr-content');
    const qrOutput = document.getElementById('qr-output');
    let qrCodeInstance = null;

    function generateQRCode() {
        const content = contentInput.value.trim();
        if (!content) {
            alert('Please enter some content for the QR code.');
            qrOutput.innerHTML = '<p class="text-muted">Your QR code will appear here</p>';
            return;
        }

        qrOutput.innerHTML = '';
        qrCodeInstance = new QRCode(qrOutput, {
            text: content,
            width: 256,
            height: 256,
            colorDark : "#E6EEF6",
            colorLight : "#0F1724",
            correctLevel : QRCode.CorrectLevel.H
        });

        // Add download buttons after generation
        const canvas = qrOutput.querySelector('canvas');
        const img = qrOutput.querySelector('img');
        if (canvas || img) {
             const downloadContainer = document.createElement('div');
             downloadContainer.className = 'absolute bottom-2 flex gap-2';
             
             const downloadPngBtn = document.createElement('button');
             downloadPngBtn.innerHTML = '<i data-lucide="download" class="h-4 w-4 mr-1"></i> PNG';
             downloadPngBtn.className = 'flex items-center bg-card border border-border text-xs font-semibold px-2 py-1 rounded-md hover:bg-secondary';
             downloadPngBtn.onclick = () => downloadQRCode('png');

             // SVG download is not directly supported by this library, we'll offer PNG
             downloadContainer.appendChild(downloadPngBtn);
             qrOutput.classList.add('relative');
             qrOutput.appendChild(downloadContainer);
             if (window.lucide) window.lucide.createIcons();
        }
    }
    
    function downloadQRCode(format) {
        const canvas = qrOutput.querySelector('canvas');
        if (canvas) {
            const dataUrl = canvas.toDataURL(`image/${format}`);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `qrcode.${format}`;
            link.click();
        }
    }

    generateBtn.addEventListener('click', generateQRCode);
}
