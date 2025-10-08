function initTool() {
    const colorPicker = document.getElementById('color-picker');
    const hexInput = document.getElementById('hex-input');
    const generateBtn = document.getElementById('generate-btn');
    const paletteOutput = document.getElementById('palette-output');

    // --- Color Conversion Helpers ---
    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        return { r: +r, g: +g, b: +b };
    }

    function rgbToHsl({r, g, b}) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, l: l };
    }

    function hslToRgb({h, s, l}) {
        let r, g, b;
        if (s == 0) {
            r = g = b = l;
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            h /= 360;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }
    
    function rgbToHex({r, g, b}) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
    
    // --- Palette Generation Logic ---
    function generatePalette(baseHex) {
        const baseRgb = hexToRgb(baseHex);
        const baseHsl = rgbToHsl(baseRgb);

        const palettes = {
            "Shades": Array.from({length: 5}, (_, i) => ({...baseHsl, l: Math.max(0, baseHsl.l - (i + 1) * 0.1) })),
            "Tints": Array.from({length: 5}, (_, i) => ({...baseHsl, l: Math.min(1, baseHsl.l + (i + 1) * 0.1) })),
            "Analogous": [-30, -15, 15, 30].map(angle => ({...baseHsl, h: (baseHsl.h + angle + 360) % 360 })),
            "Triadic": [120, 240].map(angle => ({...baseHsl, h: (baseHsl.h + angle) % 360 })),
            "Complementary": [180].map(angle => ({...baseHsl, h: (baseHsl.h + angle) % 360 }))
        };

        paletteOutput.innerHTML = '';
        
        const createColorBox = (hex) => {
            const box = document.createElement('div');
            box.className = 'h-24 rounded-lg flex flex-col items-center justify-center cursor-pointer relative group';
            box.style.backgroundColor = hex;
            box.innerHTML = `<span class="font-mono text-sm opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-black/50 text-white">${hex}</span>`;
            box.onclick = () => {
                navigator.clipboard.writeText(hex).then(() => {
                    const originalText = box.innerHTML;
                    box.innerHTML = `<span class="font-mono text-sm p-1 rounded bg-black/50 text-white">Copied!</span>`;
                    setTimeout(() => { box.innerHTML = originalText; }, 1500);
                });
            };
            return box;
        };
        
        // Base Color
        const baseContainer = document.createElement('div');
        baseContainer.className = 'col-span-full mb-4';
        baseContainer.innerHTML = '<h3 class="text-lg font-bold text-foreground mb-2">Base Color</h3>';
        baseContainer.appendChild(createColorBox(baseHex));
        paletteOutput.appendChild(baseContainer);

        for (const [name, colorsHsl] of Object.entries(palettes)) {
            const container = document.createElement('div');
            container.className = 'col-span-full mb-4';
            container.innerHTML = `<h3 class="text-lg font-bold text-foreground mb-2">${name}</h3>`;
            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-2 sm:grid-cols-5 gap-2';
            colorsHsl.forEach(hsl => {
                const rgb = hslToRgb(hsl);
                const hex = rgbToHex(rgb);
                grid.appendChild(createColorBox(hex));
            });
            container.appendChild(grid);
            paletteOutput.appendChild(container);
        }
    }
    
    // --- Event Listeners ---
    colorPicker.addEventListener('input', (e) => hexInput.value = e.target.value.toUpperCase());
    hexInput.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            colorPicker.value = e.target.value;
        }
    });
    generateBtn.addEventListener('click', () => generatePalette(hexInput.value));
    
    // Initial generation
    generatePalette(hexInput.value);
}
