/**
 * Dynamically loads a Google Font by name.
 * Prevents duplicate loading by tracking loaded fonts.
 */
const loadedFonts = new Set<string>();

export const loadFont = (fontFamily: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!fontFamily) {
            resolve();
            return;
        }

        if (loadedFonts.has(fontFamily)) {
            resolve();
            return;
        }

        // Check if the font is already available in the document (standard fonts)
        if (['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact', 'Comic Sans MS'].includes(fontFamily)) {
            resolve();
            return;
        }

        const linkId = `font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
        if (document.getElementById(linkId)) {
            loadedFonts.add(fontFamily);
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        link.rel = 'stylesheet';

        link.onload = () => {
            // Explicitly wait for the font to be loaded by the browser
            // calculated 1rem just to trigger load with some text
            document.fonts.load(`1em "${fontFamily}"`).then(() => {
                loadedFonts.add(fontFamily);
                resolve();
            }).catch(() => {
                // Fallback: resolve anyway if font loading fails, so UI doesn't hang
                loadedFonts.add(fontFamily);
                resolve();
            });
        };

        link.onerror = () => {
            console.error(`Failed to load font: ${fontFamily}`);
            reject(new Error(`Failed to load font: ${fontFamily}`));
        };

        document.head.appendChild(link);
    });
};
