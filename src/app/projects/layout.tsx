import React from 'react';
import { Metadata } from 'next';
import { projectsMeta } from '@lib/meta/projects';
import BreadcrumbStructuredData from '@components/breadcrumb-structured-data';
import { NEXT_PUBLIC_APP_URL } from '@lib/constants';

export const metadata: Metadata = projectsMeta;

export default function ProjectsLayout({ children, }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <BreadcrumbStructuredData items={[
                { name: 'Home', url: NEXT_PUBLIC_APP_URL, position: 1 },
                { name: 'Projects', url: `${NEXT_PUBLIC_APP_URL}/projects`, position: 2 },
            ]} />
            {children}
        </>
    );
}
