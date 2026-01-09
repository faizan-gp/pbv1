
export default function HowToSchema({ productName, imageUrl }: { productName: string, imageUrl?: string }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": `How to Customize Your ${productName}`,
        "description": "Step-by-step guide to designing and customizing your own product using our interactive studio.",
        "image": imageUrl ? {
            "@type": "ImageObject",
            "url": imageUrl
        } : undefined,
        "step": [
            {
                "@type": "HowToStep",
                "name": "Select Your Product",
                "text": "Choose the product size, color, and variation that you want to customize.",
                "url": "https://www.printbrawl.com/categories"
            },
            {
                "@type": "HowToStep",
                "name": "Upload Your Design",
                "text": "Upload your logo, artwork, or photo using the 'Upload' button in the design studio.",
                "image": "https://www.printbrawl.com/images/upload-icon.png"
            },
            {
                "@type": "HowToStep",
                "name": "Adjust and Position",
                "text": "Drag, resize, and rotate your design on the product preview canvas until it looks perfect."
            },
            {
                "@type": "HowToStep",
                "name": "Add Text",
                "text": "Use the text tool to add custom text, choose fonts, and pick colors."
            },
            {
                "@type": "HowToStep",
                "name": "Preview and Order",
                "text": "Check the final preview of your custom product and proceed to checkout."
            }
        ],
        "totalTime": "PT5M"
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
