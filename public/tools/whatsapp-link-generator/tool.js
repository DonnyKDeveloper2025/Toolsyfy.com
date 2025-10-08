function initTool() {
    const generateBtn = document.getElementById('generate-link-btn');
    const phoneInput = document.getElementById('phone-number');
    const messageInput = document.getElementById('prefilled-message');
    const outputSection = document.getElementById('output-section');
    const generatedLinkInput = document.getElementById('generated-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const qrCodeContainer = document.getElementById('qr-code-container');
    const buttonCodeTextarea = document.getElementById('button-code');
    const copyButtonCodeBtn = document.getElementById('copy-button-code-btn');

    let qrCodeInstance = null;

    function generate() {
        const phone = phoneInput.value.replace(/\D/g, '');
        if (!phone) {
            alert('Please enter a valid phone number with country code.');
            return;
        }
        const message = encodeURIComponent(messageInput.value);
        const link = `https://wa.me/${phone}${message ? `?text=${message}` : ''}`;
        
        // Update Link
        generatedLinkInput.value = link;
        
        // Update QR Code
        qrCodeContainer.innerHTML = '';
        qrCodeInstance = new QRCode(qrCodeContainer, {
            text: link,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        // Update Button Code
        const buttonHtml = `<a href="${link}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; padding: 10px 16px; background-color: #25D366; color: white; border-radius: 8px; text-decoration: none; font-family: sans-serif; font-size: 16px; font-weight: bold;">
  <svg viewBox="0 0 32 32" style="width: 24px; height: 24px; margin-right: 8px;" fill="white"><path d="M16.4 4A12.35 12.35 0 0 0 4 16.4 12.35 12.35 0 0 0 16.4 28.8a12.35 12.35 0 0 0 12.4-12.4A12.35 12.35 0 0 0 16.4 4z M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.543-.57-.543-.82-.543-.25 0-1.413-.06-2.578-.06-.25 0-.543-.015-.708.43-1.227 3.318.14 5.578 1.49 6.845 1.957 1.923 4.28 3.58 5.72 4.04 1.518.49 2.907.23 3.912-.595a2.94 2.94 0 0 0 .936-2.24c.06-.543-.03-1.088-.372-1.49-.342-.402-.732-.543-.984-.543z"></path></svg>
  <span>Chat on WhatsApp</span>
</a>`;
        buttonCodeTextarea.value = buttonHtml;
        buttonCodeTextarea.rows = buttonHtml.split('\n').length;
        
        outputSection.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
    }

    generateBtn.addEventListener('click', generate);

    copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(generatedLinkInput.value).then(() => {
            const originalIcon = copyLinkBtn.innerHTML;
            copyLinkBtn.innerHTML = '<i data-lucide="check" class="h-4 w-4 text-green-500"></i>';
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => { copyLinkBtn.innerHTML = originalIcon; }, 2000);
        });
    });

    copyButtonCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(buttonCodeTextarea.value).then(() => {
            const originalIcon = copyButtonCodeBtn.innerHTML;
            copyButtonCodeBtn.innerHTML = '<i data-lucide="check" class="h-4 w-4 text-green-500"></i>';
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => { copyButtonCodeBtn.innerHTML = originalIcon; }, 2000);
        });
    });
}
