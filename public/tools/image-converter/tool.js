function initTool() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewArea = document.getElementById('preview-area');
    const imagePreview = document.getElementById('image-preview');
    const fileNameEl = document.getElementById('file-name');
    const formatSelect = document.getElementById('format-select');
    const convertBtn = document.getElementById('convert-btn');

    let currentFile = null;

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropZone.classList.add('hidden');
            previewArea.classList.remove('hidden');
            fileNameEl.textContent = file.name;
            convertBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('border-brand-primary'));
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('border-brand-primary'));
    });

    dropZone.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));

    convertBtn.addEventListener('click', () => {
        if (!currentFile) return;

        const targetFormat = formatSelect.value;
        const mimeType = `image/${targetFormat}`;
        
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // For formats that don't support transparency (like JPEG), draw a white background
            if (targetFormat === 'jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentFile.name.split('.').slice(0, -1).join('.')}.${targetFormat}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, mimeType);
        };
        img.src = imagePreview.src;
    });
}
