import React from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQPageStructuredDataProps {
    items: FAQItem[];
}

export default function FAQPageStructuredData({ items }: FAQPageStructuredDataProps) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map((item) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
