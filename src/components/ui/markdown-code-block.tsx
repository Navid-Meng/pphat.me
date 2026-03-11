"use client";

import React from 'react';
import { cn } from '@lib/utils';
import { CopyIcon, type CopyIconHandle } from '@components/ui/icons/copy';

interface MarkdownCodeBlockProps {
    code: string;
    language?: string;
    className?: string;
    children: React.ReactNode;
}

export function MarkdownCodeBlock({ code, language, className, children }: MarkdownCodeBlockProps) {
    const [copied, setCopied] = React.useState(false);
    const copyRef = React.useRef<CopyIconHandle>(null);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            copyRef.current?.startAnimation();
            window.setTimeout(() => {
                setCopied(false);
                copyRef.current?.stopAnimation();
            }, 1500);
        } catch {
            setCopied(false);
        }
    };

    return (
        /* CodeExampleWrapper */
        <div className="not-prose group/code-block my-6 rounded-2xl bg-gray-950">
            {/* inner card — scheme-dark + inset-ring */}
            <div className="rounded-2xl flex flex-col gap-0.5 p-1 text-sm scheme-dark dark:bg-white/5 dark:inset-ring dark:inset-ring-white/10">

                {/* header: filename + absolute copy button */}
                <div className="relative flex items-center justify-between p-1">
                    <div className="px-3 text-xs/5 text-gray-400 dark:text-white/50">
                        {language || 'code'}
                    </div>
                    <div
                        className={cn(
                            'bg-foreground/5 ring-1 w-fit ring-foreground/10 justify-end flex rounded-full p-1 transition-all',
                            copied && 'opacity-100!'
                        )}
                    >
                        <button
                            type="button"
                            onClick={handleCopy}
                            aria-label="Copy code"
                            title="Copy code"
                            className={cn(
                                'flex cursor-pointer rounded-full p-0.5 min-w-5 h-5 hover:ring ring-foreground/20 hover:bg-foreground/10 transition-all items-center justify-center text-white/75 hover:text-white',
                                copied && 'text-emerald-400!'
                            )}
                        >
                            <CopyIcon ref={copyRef} size={12} isAnimated />
                            <span className={cn('overflow-hidden transition-all', copied ? 'w-auto opacity-100 ml-1' : 'w-0 opacity-0 ')}>
                                Copied!
                            </span>
                        </button>
                    </div>
                </div>

                {/* HighlightedCode body */}
                <div className={cn(
                    '*:flex *:*:shrink-0 *:*:grow *:overflow-auto *:rounded-xl *:bg-white/10! *:p-0 dark:*:bg-white/5!',
                    '**:[.line]:isolate **:[.line]:block **:[.line]:not-last:min-h-[1lh]',
                    '*:inset-ring *:inset-ring-white/10 dark:*:inset-ring-white/5',
                    '*:*:max-w-none',
                )}>
                    <pre>
                        <code className={cn('font-mono p-3 text-sm leading-relaxed text-slate-50', className)}>
                            {children}
                        </code>
                    </pre>
                </div>

            </div>
        </div>
    );
}