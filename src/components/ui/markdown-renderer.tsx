"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@lib/utils';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div
            className={cn(
                'prose prose-lg dark:prose-invert max-w-none',
                'prose-headings:font-bold prose-headings:tracking-tight',
                'prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12 prose-h1:leading-tight',
                'prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:leading-tight',
                'prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:leading-snug',
                'prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6 prose-h4:leading-snug',
                'prose-h5:text-lg prose-h5:mb-2 prose-h5:mt-5 prose-h5:leading-normal',
                'prose-h6:text-base prose-h6:mb-2 prose-h6:mt-4 prose-h6:leading-normal prose-h6:font-semibold',
                'prose-p:mb-4 prose-p:leading-relaxed',
                'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                'prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic',
                'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono',
                'prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:font-mono prose-pre:text-sm',
                'prose-img:rounded-lg prose-img:shadow-md',
                'prose-ul:list-disc prose-ol:list-decimal',
                'prose-li:mb-1',
                '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground',
                className
            )}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
