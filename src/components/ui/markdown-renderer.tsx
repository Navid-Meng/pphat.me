import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@lib/utils';
import { MarkdownCodeBlock } from '@components/ui/markdown-code-block';
import { MarkdownImage } from '@components/ui/markdown-image';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

function extractText(node: React.ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map(extractText).join('');
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
        return extractText(node.props.children);
    }

    return '';
}

const markdownComponents: Components = {
    pre({ children }) {
        return <>{children}</>;
    },
    code({ className, children, ...props }) {
        const languageMatch = /language-([a-z0-9-]+)/i.exec(className || '');
        const codeText = extractText(children).replace(/\n$/, '');
        const isBlock = Boolean(languageMatch) || codeText.includes('\n');

        if (!isBlock) {
            return (
                <code
                    className={cn('rounded bg-muted px-1 py-0.5 font-mono text-sm', className)}
                    {...props}
                >
                    {children}
                </code>
            );
        }

        return (
            <MarkdownCodeBlock
                code={codeText}
                language={languageMatch?.[1]}
                className={className}
            >
                {children}
            </MarkdownCodeBlock>
        );
    },
    img({ src, alt, ...props }) {
        const safeSrc = typeof src === 'string' ? src : undefined;
        return <MarkdownImage src={safeSrc} alt={alt} {...props} />;
    }
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div
            className={cn(
                'prose dark:prose-invert max-w-none',
                'prose-headings:font-bold prose-headings:tracking-tight',
                'prose-h1:mt-2 prose-h1:text-3xl prose-h1:font-medium prose-h1:tracking-tight prose-h1:text-gray-950 dark:prose-h1:text-white',
                'prose-h2:mb-6 prose-h2:text-lg prose-h2:font-semibold prose-h2:tracking-tight prose-h2:text-gray-950 dark:prose-h2:text-white',
                'prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:leading-snug',
                'prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6 prose-h4:leading-snug',
                'prose-h5:text-lg prose-h5:mb-2 prose-h5:mt-5 prose-h5:leading-normal',
                'prose-h6:text-base prose-h6:mb-2 prose-h6:mt-4 prose-h6:leading-normal prose-h6:font-semibold',
                'prose-p:mt-6 prose-p:text-base/7 prose-p:text-gray-700 dark:prose-p:text-gray-300',
                'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                'prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic',
                'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono',
                'prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 prose-pre:shadow-none prose-pre:ring-0 prose-pre:rounded-none prose-pre:text-inherit prose-pre:overflow-visible',
                'prose-pre:before:content-none prose-pre:after:content-none',
                'prose-img:rounded-lg prose-img:shadow-md',
                'prose-ul:list-disc prose-ol:list-decimal',
                'prose-li:mb-1',
                className
            )}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
