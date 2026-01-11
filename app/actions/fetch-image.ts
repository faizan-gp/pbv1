'use server';

export async function fetchImageAsBase64(url: string) {
    try {
        if (!url || !url.startsWith('http')) {
            throw new Error('Invalid URL');
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/png';

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error('Error in fetchImageAsBase64:', error);
        return null;
    }
}
