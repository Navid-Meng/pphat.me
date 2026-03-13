import React from 'react';
import {
    appName,
    NEXT_PUBLIC_APP_URL,
    PERSON_NAME,
    PERSON_ALTERNATE_NAME,
    PERSON_JOB_TITLE,
    COMPANY_NAME,
    GITHUB_URL,
    LINKEDIN_URL
} from '@lib/constants';

export default function AboutStructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": `${NEXT_PUBLIC_APP_URL}/about`,
        "name": `About ${appName}`,
        "description": `I'm ${PERSON_NAME} (${PERSON_ALTERNATE_NAME}), a ${PERSON_JOB_TITLE}.`,
        "url": `${NEXT_PUBLIC_APP_URL}/about`,
        "dateCreated": "2021-01-01",
        "dateModified": new Date().toISOString().split('T')[0],
        "mainEntity": {
            "@type": "Person",
            "@id": `${NEXT_PUBLIC_APP_URL}#person`,
            "name": PERSON_NAME,
            "alternateName": PERSON_ALTERNATE_NAME,
            "description": `I'm ${PERSON_NAME} (${PERSON_ALTERNATE_NAME}), a ${PERSON_JOB_TITLE}.`,
            "jobTitle": PERSON_JOB_TITLE,
            "worksFor": {
                "@type": "Organization",
                "name": COMPANY_NAME,
            },
            "url": `${NEXT_PUBLIC_APP_URL}/about`,
            "sameAs": [
                GITHUB_URL,
                LINKEDIN_URL
            ]
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
