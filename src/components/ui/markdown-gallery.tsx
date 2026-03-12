"use client";

import React from 'react';
import { cn } from '@lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, RotateCw, Download } from 'lucide-react';
import Image from 'next/image';

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
    const [selectedImage, setSelectedImage] = React.useState<{ src: string; alt: string; } | null>(null);
    const [currentIndex, setCurrentIndex] = React.useState<number>(0);
    const [imageLoading, setImageLoading] = React.useState(false);
    const [rotation, setRotation] = React.useState<number>(0);
    const showCaptions = dataCaptions === 'true';
    const items = React.Children.toArray(children).filter((child) => {
        if (typeof child === 'string') {
            return child.trim().length > 0;
        }

        return React.isValidElement(child);
    });

    const getImageData = (item: React.ReactNode) => {
        if (React.isValidElement(item)) {
            // Check if it's an img element or has an img child
            const findImageProps = (element: any): { src?: string; alt?: string } | null => {
                if (element.type === 'img') {
                    return { src: element.props.src, alt: element.props.alt };
                }
                if (element.props?.src) {
                    return { src: element.props.src, alt: element.props.alt };
                }
                if (element.props?.children) {
                    const children = React.Children.toArray(element.props.children);
                    for (const child of children) {
                        if (React.isValidElement(child)) {
                            const result = findImageProps(child);
                            if (result) return result;
                        }
                    }
                }
                return null;
            };
            return findImageProps(item);
        }
        return null;
    };

    const removeWidthParam = (url: string): string => {
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('w', '1000');
            urlObj.searchParams.set('width', '1000');
            return urlObj.toString();
        } catch {
            // If URL parsing fails, return original
            return url;
        }
    };

    const handleImageClick = React.useCallback((item: React.ReactNode, index: number) => {
        const imageData = getImageData(item);
        if (imageData?.src) {
            const cleanSrc = removeWidthParam(imageData.src);
            setImageLoading(true);
            setCurrentIndex(index);
            setRotation(0);
            setSelectedImage({ src: cleanSrc, alt: imageData.alt || 'Image' });
        }
    }, []);

    const handleNext = React.useCallback(() => {
        const nextIndex = (currentIndex + 1) % items.length;
        setImageLoading(true);
        handleImageClick(items[nextIndex], nextIndex);
    }, [currentIndex, items, handleImageClick]);

    const handlePrev = React.useCallback(() => {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        setImageLoading(true);
        handleImageClick(items[prevIndex], prevIndex);
    }, [currentIndex, items, handleImageClick]);

    const handleClose = () => {
        setSelectedImage(null);
        setImageLoading(false);
        setRotation(0);
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleDownload = async () => {
        if (!selectedImage) return;
        
        try {
            const response = await fetch(selectedImage.src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = selectedImage.alt || 'image';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'r' || e.key === 'R') handleRotate();
        };
        if (selectedImage) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [selectedImage, currentIndex, handleNext, handlePrev]);

    return (
        <>
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
                            className="group bg-background/40 border border-border/60 overflow-hidden rounded-2xl p-1 mb-3 md:mb-4 break-inside-avoid [&_img]:h-auto [&_img]:w-full cursor-pointer hover:border-primary/40 transition-colors"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                ease: [0.25, 0.1, 0.25, 1]
                            }}
                            onClick={() => handleImageClick(item, index)}
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

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    >
                        {/* Top Controls */}
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload();
                                }}
                                className="p-2 rounded-full bg-background/20 hover:bg-background/30 transition-colors"
                                aria-label="Download image"
                            >
                                <Download className="w-6 h-6 text-white" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRotate();
                                }}
                                className="p-2 rounded-full bg-background/20 hover:bg-background/30 transition-colors"
                                aria-label="Rotate image"
                            >
                                <RotateCw className="w-6 h-6 text-white" />
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-full bg-background/20 hover:bg-background/30 transition-colors"
                                aria-label="Close preview"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        
                        {/* Navigation Buttons */}
                        {items.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrev();
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background/20 hover:bg-background/30 transition-colors"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNext();
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background/20 hover:bg-background/30 transition-colors"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </button>
                            </>
                        )}
                        
                        <motion.div
                            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.alt}
                                width={1920}
                                height={1080}
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: 'transform 0.3s ease-in-out'
                                }}
                                className={cn(
                                    "max-w-full max-h-full w-auto h-auto object-contain rounded-lg transition-opacity duration-300",
                                    imageLoading ? "opacity-0" : "opacity-100"
                                )}
                                unoptimized={selectedImage.src.startsWith('http')}
                                onLoad={() => setImageLoading(false)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
