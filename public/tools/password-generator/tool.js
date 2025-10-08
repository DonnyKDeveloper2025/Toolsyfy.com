function initTool() {
    const passwordOutput = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    const lengthSlider = document.getElementById('length-slider');
    const lengthLabel = document.getElementById('length-label');
    const includeUppercase = document.getElementById('include-uppercase');
    const includeLowercase = document.getElementById('include-lowercase');
    const includeNumbers = document.getElementById('include-numbers');
    const includeSymbols = document.getElementById('include-symbols');
    const generateBtn = document.getElementById('generate-btn');

    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    function generatePassword() {
        const length = parseInt(lengthSlider.value, 10);
        let characterPool = '';
        if (includeUppercase.checked) characterPool += charSets.uppercase;
        if (includeLowercase.checked) characterPool += charSets.lowercase;
        if (includeNumbers.checked) characterPool += charSets.numbers;
        if (includeSymbols.checked) characterPool += charSets.symbols;

        if (characterPool === '') {
            passwordOutput.value = 'Select at least one character type';
            return;
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characterPool.length);
            password += characterPool[randomIndex];
        }
        passwordOutput.value = password;
    }

    function updateLengthLabel() {
        lengthLabel.textContent = lengthSlider.value;
    }

    lengthSlider.addEventListener('input', () => {
        updateLengthLabel();
        generatePassword();
    });

    [includeUppercase, includeLowercase, includeNumbers, includeSymbols].forEach(checkbox => {
        checkbox.addEventListener('change', generatePassword);
    });

    generateBtn.addEventListener('click', generatePassword);
    
    copyBtn.addEventListener('click', () => {
        if (!passwordOutput.value) return;
        navigator.clipboard.writeText(passwordOutput.value).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check" class="h-5 w-5 text-green-500"></i>';
            if(window.lucide) window.lucide.createIcons();
            setTimeout(() => { copyBtn.innerHTML = originalIcon; }, 2000);
        });
    });

    // Initial setup
    updateLengthLabel();
    generatePassword();
}
