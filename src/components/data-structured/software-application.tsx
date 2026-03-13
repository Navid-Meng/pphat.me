import React from 'react';
import { NEXT_PUBLIC_APP_URL, PERSON_NAME, appName } from '@lib/constants';

interface SoftwareApplicationStructuredDataProps {
    name: string;
    description: string;
    url: string;
    repositoryUrl?: string;
    applicationCategory?: string;
    operatingSystem?: string;
    screenshots?: string[];
    datePublished?: string;
    keywords?: string[];
}

export default function SoftwareApplicationStructuredData({
    name,
    description,
    url,
    repositoryUrl,
    applicationCategory = 'WebApplication',
    operatingSystem = 'Web Browser',
    screenshots = [],
    datePublished,
    keywords = []
}: SoftwareApplicationStructuredDataProps) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": name,
        "description": description,
        "url": url,
        "applicationCategory": applicationCategory,
        "operatingSystem": operatingSystem,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "@id": `${NEXT_PUBLIC_APP_URL}#person`,
            "name": PERSON_NAME
        },
        "creator": {
            "@type": "Person",
            "@id": `${NEXT_PUBLIC_APP_URL}#person`,
            "name": PERSON_NAME
        },
        "publisher": {
            "@type": "Person",
            "name": appName,
            "url": NEXT_PUBLIC_APP_URL
        },
        ...(datePublished && { "datePublished": datePublished }),
        ...(keywords.length > 0 && { "keywords": keywords.join(', ') }),
        ...(repositoryUrl && { "codeRepository": repositoryUrl }),
        ...(screenshots.length > 0 && {
            "screenshot": screenshots.map(src => ({
                "@type": "ImageObject",
                "url": src.startsWith('http') ? src : `${NEXT_PUBLIC_APP_URL}${src}`
            }))
        })
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
