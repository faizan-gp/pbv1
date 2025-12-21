
/**
 * Generates a composite image by overlaying a design texture onto a base product image.
 * Uses HTML Canvas API.
 * 
 * @param baseImageUrl URL of the product image (shirt)
 * @param overlayImageUrl URL of the design texture (from fabric.js)
 * @param zone Configuration for where the design should be placed { top, left, width, height }
 * @param originalCanvasSize The size of the canvas used in the editor (e.g. 1000px)
 * @returns Promise<string> Data URL of the composite image
 */
export async function generateCompositeImage(
    baseImageUrl: string,
    overlayImageUrl: string,
    zone: { top: number, left: number, width: number, height: number, rotation?: number },
    originalCanvasSize: number
): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        const baseImage = new Image();
        baseImage.crossOrigin = 'anonymous';
        baseImage.src = baseImageUrl;

        baseImage.onload = () => {
            // Set canvas size to match base image natural size for high quality
            canvas.width = baseImage.naturalWidth;
            canvas.height = baseImage.naturalHeight;

            // 1. Draw Base Image
            ctx.drawImage(baseImage, 0, 0);

            // If no overlay, just return base
            if (!overlayImageUrl) {
                resolve(canvas.toDataURL('image/png'));
                return;
            }

            const overlayImage = new Image();
            overlayImage.crossOrigin = 'anonymous';
            overlayImage.src = overlayImageUrl;

            overlayImage.onload = () => {
                // 2. Calculate Position
                // The zone coordinates are relative to the originalCanvasSize (e.g. 1000x1000)
                // We need to scale them to the actual baseImage size
                const scaleX = canvas.width / originalCanvasSize;
                const scaleY = canvas.height / originalCanvasSize;

                // Assuming square canvas mapping for simplicity as per current app logic, 
                // but using separate scales is safer if aspect ratios differ (though app seems to enforce square).
                // It's safer to use the smaller scale or explicit mapping if we knew the exact coordinate space mapping, 
                // but based on ProductPreview, it uses percentages.

                // Let's use percentage based calculation like ProductPreview.tsx
                // left: (zone.left / originalCanvasSize) * 100 %

                const targetX = (zone.left / originalCanvasSize) * canvas.width;
                const targetY = (zone.top / originalCanvasSize) * canvas.height;
                const targetW = (zone.width / originalCanvasSize) * canvas.width;
                const targetH = (zone.height / originalCanvasSize) * canvas.height;

                ctx.save();

                // 3. Set Blend Mode
                ctx.globalCompositeOperation = 'multiply';

                // 4. Apply Transformations if needed (e.g. rotation if we passed it, though strictly zone doesn't usually have it in this app yet)
                // For now, simple placement

                ctx.drawImage(overlayImage, targetX, targetY, targetW, targetH);

                ctx.restore();

                resolve(canvas.toDataURL('image/png', 0.8));
            };

            overlayImage.onerror = (err) => {
                console.error("Error loading overlay image", err);
                // Return base image on failure
                resolve(canvas.toDataURL('image/png'));
            };
        };

        baseImage.onerror = (err) => reject(err);
    });
}
