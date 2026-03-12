"use client";

import React from 'react';
import { cn } from '@lib/utils';
import { motion } from 'motion/react';

interface MarkdownGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    'data-columns'?: string;
    'data-captions'?: string;
}

function getColumnsClass(columnsValue?: string): string {
    const columns = Number(columnsValue);

    if (columns >= 4) {
        return 'sm:columns-2 lg:columns-4';
    }

    if (columns === 3) {
        return 'sm:columns-2 lg:columns-3';
    }

    return 'sm:columns-2';
}

export function MarkdownGallery({
    children,
    className,
    'data-columns': dataColumns,
    'data-captions': dataCaptions,
    ...props
}: MarkdownGalleryProps) {
    const showCaptions = dataCaptions === 'true';
    const items = React.Children.toArray(children).filter((child) => {
        if (typeof child === 'string') {
            return child.trim().length > 0;
        }

        return React.isValidElement(child);
    });

    return (
        <div
            className={cn(
                'not-prose my-8 columns-2 [column-gap:0.75rem] md:[column-gap:1rem]',
                getColumnsClass(dataColumns),
                className
            )}
            {...props}
        >
            {items.map((item, index) => {
                const caption = React.isValidElement<{ alt?: string }>(item)
                    ? item.props.alt
                    : undefined;

                return (
                    <motion.figure
                        key={`gallery-item-${index}`}
                        className="group bg-background/40 border border-border/60 overflow-hidden rounded-2xl p-1 mb-3 md:mb-4 break-inside-avoid [&_img]:h-auto [&_img]:w-full"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: [0.25, 0.1, 0.25, 1]
                        }}
                    >
                        <div className="overflow-hidden">{item}</div>
                        {showCaptions && caption ? (
                            <figcaption className="text-muted-foreground px-3 py-2 text-sm">
                                {caption}
                            </figcaption>
                        ) : null}
                    </motion.figure>
                );
            })}
        </div>
    );
}
