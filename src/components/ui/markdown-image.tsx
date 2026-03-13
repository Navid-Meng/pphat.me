"use client";

import React from 'react';
import Image from 'next/image';

interface MarkdownImageProps {
    src?: string;
    alt?: string;
    className?: string;
    fallbackSrc?: string;
}

const DEFAULT_FALLBACK_SRC = 'https://cdn.api.pphat.stackdev.cloud/api/image/404.png?fm=webp&w=500';

export function MarkdownImage({ src, alt, className, fallbackSrc = DEFAULT_FALLBACK_SRC }: MarkdownImageProps) {
    const [currentSrc, setCurrentSrc] = React.useState(src || fallbackSrc);

    React.useEffect(() => {
        setCurrentSrc(src || fallbackSrc);
    }, [src, fallbackSrc]);

    const handleError = () => {
        if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
        }
    };

    return (
        <Image
            src={currentSrc}
            alt={alt || 'Image'}
            width={800}
            height={450}
            onError={handleError}
            loading="lazy"
            unoptimized
            className={['rounded-xl w-full h-auto', className].filter(Boolean).join(' ')}
        />
    );
}