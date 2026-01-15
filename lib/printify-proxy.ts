
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';

// Configuration
const PRINTIFY_INTERNAL_URLS = {
    preview: 'https://images.printify.com/preview',
    templateLibrary: 'https://images.printify.com/api/template-library',
    fonts: 'https://printify.com/designer-api/api/v2/fonts',
    editor: 'https://printify.com/app/editor'
};

const getSessionCookies = () => process.env.PRINTIFY_SESSION_COOKIES || '';

const isProxyConfigured = () => {
    const cookies = getSessionCookies();
    return cookies && cookies.length > 0;
};

// Helper
const generateObjectId = () => {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

class PrintifyProxyService {
    private client: AxiosInstance | null = null;

    private getClient() {
        if (!this.client) {
            const cookies = getSessionCookies();
            if (!cookies) {
                console.warn('PRINTIFY_SESSION_COOKIES is not set.');
            }

            this.client = axios.create({
                timeout: 60000,
                headers: {
                    'Cookie': cookies,
                    'Origin': 'https://printify.com',
                    'Referer': 'https://printify.com/app/editor/706/99/dtg',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
        }
        return this.client;
    }

    public async checkSession() {
        if (!isProxyConfigured()) {
            return { valid: false, error: 'Session cookies not configured' };
        }

        try {
            const client = this.getClient();
            const response = await client.get(PRINTIFY_INTERNAL_URLS.fonts, {
                validateStatus: (status) => status < 500
            });

            return {
                valid: response.status === 200,
                status: response.status,
                message: response.status === 200 ? 'Session active' : 'Session may be expired'
            };
        } catch (error: any) {
            return {
                valid: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    private buildDesignPayload(design: any, options: any = {}) {
        const {
            imageUrl,
            imageBase64,
            position = { x: 0.5, y: 0.5 },
            scale = 1,
            rotation = 0,
            printPosition = 'front'
        } = design;

        const {
            blueprintId = 706,
            providerId = 99,
            variantId = 73207,
            decoratorId = 99,
            cameraId = 112433
        } = options;

        const layerId = generateObjectId();
        const imageId = `${layerId}_${generateObjectId()}`;

        const imageLayer: any = {
            id: layerId,
            type: 'image/png',
            scale: scale,
            angle: rotation,
            x: position.x,
            y: position.y,
            flipX: false,
            flipY: false,
            layerType: 'image',
            imageId: imageId,
            name: 'upload.png',
            sourceMimeType: 'image/png',
            isShutterstock: false
        };

        if (design.printifyImageId) {
            imageLayer.id = design.printifyImageId;
            imageLayer.imageId = `${design.printifyImageId}_${generateObjectId()}`;
            imageLayer.src = design.imageUrl;
            imageLayer.source = 'computer';
            imageLayer.fileName = 'upload.png';
        } else if (imageUrl) {
            imageLayer.source = 'url';
            imageLayer.src = imageUrl;
        } else if (imageBase64) {
            imageLayer.source = 'base64';
            imageLayer.data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        }

        const placeholders = [
            {
                dom_id: ['#placeholder_back'],
                images: printPosition === 'back' ? [imageLayer] : [],
                position: 'back',
                printable: true,
                decoration_method: 'dtg'
            },
            {
                dom_id: ['#placeholder_front'],
                images: printPosition === 'front' ? [imageLayer] : [],
                position: 'front',
                printable: true,
                decoration_method: 'dtg'
            }
        ];

        return {
            blueprint_id: blueprintId,
            print_provider_id: providerId,
            decorator_id: decoratorId,
            variant_id: variantId,
            camera_id: cameraId,
            size: 2048,
            format: 'jpeg',
            mockup_mode: 'RGB',
            new_embroidery_color_palette: true,
            print: {
                placeholders: placeholders,
                print_on_side: false,
                mirror: false,
                canvas: false,
                font_color: '#000',
                country: 'US'
            }
        };
    }

    public async uploadImage(imageBuffer: Buffer, filename: string = 'upload.png') {
        if (!isProxyConfigured()) {
            throw new Error('Proxy not configured');
        }

        const client = this.getClient();
        const formData = new FormData();
        formData.append('file', imageBuffer, { filename });

        try {
            console.log('📤 Uploading image to Printify storage...');
            const response = await client.post('https://images.printify.com/storage/anonymous?scale=2048', formData, {
                headers: { ...formData.getHeaders() }
            });

            if (!response.data.id) {
                throw new Error('Upload successful but no ID returned');
            }
            return {
                id: response.data.id,
                uri: response.data.uri || response.data.fullSizeUri
            };
        } catch (error: any) {
            console.error('❌ Upload Failed:', error.message);
            throw error;
        }
    }

    public async generateMockupPreview(design: any, options: any = {}) {
        if (!isProxyConfigured()) {
            throw new Error('Proxy not configured. Set PRINTIFY_SESSION_COOKIES in .env');
        }

        const { blueprintId = 706, variantId = 73207, printPosition = 'front' } = options;
        const client = this.getClient();

        // Auto-upload if we only have base64
        if (design.imageBase64 && !design.printifyImageId) {
            try {
                console.log('🔄 Auto-uploading base64 image to Printify...');
                const imageBuffer = Buffer.from(design.imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                const uploadResult = await this.uploadImage(imageBuffer);
                design.printifyImageId = uploadResult.id;
                design.imageUrl = uploadResult.uri; // Also set URL just in case
                console.log(`✅ Uploaded image: ${uploadResult.id}`);
            } catch (e: any) {
                console.error('❌ Failed to auto-upload image:', e.message);
                throw new Error(`Failed to upload image: ${e.message}`);
            }
        }

        // Hardcoded cameras for 706/99
        let targetCameras = [
            { id: 98445, label: 'Front', position: 'front' },
            { id: 98446, label: 'Back', position: 'back' },
            { id: 112433, label: 'Person 1 Front', position: 'other' },
            { id: 112434, label: 'Person 1 Back', position: 'other' },
            { id: 98448, label: 'Person 2', position: 'other' },
            { id: 100630, label: 'Person 3 Front', position: 'other' },
            { id: 110640, label: 'Person 3 Back', position: 'other' }
        ].filter(c => {
            // Basic filter: keep all if not specified, or prioritize relevant ones
            // For now, let's just generate all and let frontend decide
            return true;
        });


        // Generate for ALL cameras regardless of print position
        // This satisfies the user request to "show all mockups" (e.g. show back view even if printing on front)
        // Since printPosition correctly places the design on the placeholder, the other views will just be blank/appropriate.

        // Removed filter logic here.

        console.log(`📸 Generating mockups for ${targetCameras.length} views...`);

        const mockupPromises = targetCameras.map(async (camera) => {
            const payload = this.buildDesignPayload(design, {
                ...options,
                cameraId: camera.id
            });

            try {
                const response = await client.post(PRINTIFY_INTERNAL_URLS.preview, payload, {
                    headers: { 'Content-Type': 'application/json' },
                    responseType: 'arraybuffer',
                    validateStatus: (status) => status < 500
                });

                if (response.status !== 200) {
                    console.error(`❌ Mockup failed for camera ${camera.id} with status ${response.status}`);
                    try {
                        console.error('Response:', Buffer.from(response.data).toString());
                    } catch (err) {
                        console.error('Could not read response body');
                    }
                    return null;
                }

                const imageBuffer = Buffer.from(response.data);
                const base64Image = imageBuffer.toString('base64');
                const contentType = response.headers['content-type'] || 'image/png';

                return {
                    src: `data:${contentType};base64,${base64Image}`,
                    variantId: variantId,
                    blueprintId: blueprintId,
                    position: camera.label
                };
            } catch (e: any) {
                console.error(`❌ Mockup failed for camera ${camera.id}:`, e.message, e.response?.data?.toString());
                return null;
            }
        });

        const results = await Promise.all(mockupPromises);
        const successfulMockups = results.filter((m): m is NonNullable<typeof m> => m !== null);

        if (successfulMockups.length === 0) {
            throw new Error('All mockup generations failed');
        }

        return { success: true, mockups: successfulMockups };
    }
}

export const printifyProxy = new PrintifyProxyService();
