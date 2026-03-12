'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';

interface ScrollToTopButtonProps {
    showAfter?: number;
    className?: string;
}

export function ScrollToTopButton({ showAfter = 320, className }: ScrollToTopButtonProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > showAfter);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showAfter]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div
            className={cn(
                'fixed bottom-5 right-5 z-50 transition-all duration-300',
                'sm:bottom-6 sm:right-6',
                isVisible
                    ? 'translate-y-0 opacity-100 pointer-events-auto'
                    : 'translate-y-4 opacity-0 pointer-events-none',
                className
            )}
        >
            <div className="bg-foreground/5 ring-1 ring-foreground/10 rounded-full p-1 backdrop-blur-sm">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                    className="rounded-full p-2 hover:ring ring-foreground/20 hover:bg-foreground/10"
                >
                    <ArrowUp className="size-4" />
                </Button>
            </div>
        </div>
    );
}