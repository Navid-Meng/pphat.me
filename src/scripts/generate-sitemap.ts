import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { NEXT_PUBLIC_APP_URL } from '../lib/constants';

interface SitemapRoute {
    path: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
    lastmod?: string;
}

interface PostData {
    id: string;
    slug: string;
    published: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface ProjectData {
    id: string;
    title: string;
    published: boolean;
    createdAt: string;
    updatedAt?: string;
}

function getBaseUrl(): string {
    const raw = NEXT_PUBLIC_APP_URL.trim();
    const parsed = new URL(raw);
    if (parsed.hostname.startsWith('www.')) {
        parsed.hostname = parsed.hostname.slice(4);
    }
    return parsed.toString().replace(/\/$/, '');
}

function xmlEscape(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function formatDate(value: string): string {
    return new Date(value).toISOString().slice(0, 10);
}

function toAbsoluteUrl(path: string): string {
    return `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

function isExcludedPath(path: string): boolean {
    return EXCLUDED_PATHS.some((excluded) => path.startsWith(excluded.replace('*', '')));
}

// Validate URL status code (optional - for production validation)
async function validateUrl(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.status === 200;
    } catch (error) {
        console.warn(`⚠️  Could not validate URL: ${url}`);
        return true; // Assume valid if we can't check (e.g., during build)
    }
}

// Define static routes for the site (excluding admin/auth pages)
// Only include actual HTML pages that users visit, not static files
const STATIC_ROUTES: SitemapRoute[] = [
    { path: '/', changefreq: 'weekly', priority: 1.0 },
    { path: '/about', changefreq: 'monthly', priority: 0.8 },
    { path: '/contact', changefreq: 'monthly', priority: 0.8 },
    { path: '/gallery', changefreq: 'monthly', priority: 0.8 },
    { path: '/posts', changefreq: 'weekly', priority: 0.9 },
    { path: '/projects', changefreq: 'monthly', priority: 0.8 },
    { path: '/rss.xml', changefreq: 'daily', priority: 0.5 },
    { path: '/atom.xml', changefreq: 'daily', priority: 0.5 },
    { path: '/feed.json', changefreq: 'daily', priority: 0.5 },
];

// Define paths that should be excluded from sitemap
const EXCLUDED_PATHS = [
    '/admin/',
    '/login',
    '/(auth)/',
    '/posts/[slug]', // This is a template, not an actual page
    '/data/', // JSON data files
    '/google', // Google verification files
];

// Default is off: only include /projects listing page, not every /projects/:id detail URL.
const INCLUDE_PROJECT_DETAIL_IN_SITEMAP = process.env.INCLUDE_PROJECT_DETAIL_IN_SITEMAP === 'true';

// Get dynamic post detail routes from post data
function fetchPostRoutes(): SitemapRoute[] {
    try {
        // Read posts from JSON file
        const postsFilePath = join(process.cwd(), 'public/data/post.json');

        const postsData = JSON.parse(readFileSync(postsFilePath, 'utf-8'));
        const posts = postsData.posts as PostData[];

        // Filter published posts and create route objects
        const publishedPosts = posts.filter(post => post.published);
        console.log(`${publishedPosts.length} posts are published and will be included in sitemap`);

        return publishedPosts.map(post => ({
            path: `/posts/${post.slug}`,
            changefreq: 'monthly' as const,
            priority: 0.7,
            lastmod: new Date(post.updatedAt || post.createdAt).toISOString().split('T')[0]
        }));
    } catch (error) {
        console.error('Error reading post data:', error);
        return [];
    }
}

// Get dynamic project routes from project data
function fetchProjectRoutes(): SitemapRoute[] {
    try {
        // Read projects from JSON file
        const projectsFilePath = join(process.cwd(), 'public/data/project.json');

        const projectsData = JSON.parse(readFileSync(projectsFilePath, 'utf-8'));
        const projects = projectsData.posts as ProjectData[]; // Note: projects are stored in 'posts' array

        // Filter published projects and create route objects
        const publishedProjects = projects.filter(project => project.published);
        console.log(`${publishedProjects.length} projects are published and will be included in sitemap`);
        return publishedProjects.map(project => ({
            path: `/projects/${project.id}`,
            changefreq: 'monthly' as const,
            priority: 0.6,
            lastmod: formatDate(project.updatedAt || project.createdAt)
        }));
    } catch (error) {
        console.error('Error reading project data:', error);
        return [];
    }
}

// Generate and save the sitemap
export async function createSitemap(): Promise<void> {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const postRoutes = fetchPostRoutes();
        const projectRoutes = INCLUDE_PROJECT_DETAIL_IN_SITEMAP ? fetchProjectRoutes() : [];
        const allRoutes = [...STATIC_ROUTES, ...postRoutes, ...projectRoutes];

        // Filter excluded paths and deduplicate by path.
        const dedupedByPath = new Map<string, SitemapRoute>();
        allRoutes.forEach((route) => {
            if (!isExcludedPath(route.path)) {
                dedupedByPath.set(route.path, route);
            }
        });
        const filteredRoutes = Array.from(dedupedByPath.values());

        console.log('\n📁 Site Routes:');
        console.log(`📊 Total routes: ${filteredRoutes.length}`);
        console.log(`📝 Static routes: ${STATIC_ROUTES.length}`);
        console.log(`📄 Post routes: ${postRoutes.length}`);
        console.log(`🧩 Project routes: ${projectRoutes.length}`);
        console.log(`🛠️ Project detail in sitemap: ${INCLUDE_PROJECT_DETAIL_IN_SITEMAP ? 'enabled' : 'disabled'}`);
        console.log(`🚫 Excluded patterns: ${EXCLUDED_PATHS.join(', ')}`);

        // Validate URLs in production environment (optional)
        const validateUrls = process.env.VALIDATE_SITEMAP_URLS === 'true';
        let validatedRoutes = filteredRoutes;

        if (validateUrls) {
            console.log('\n🔍 Validating URLs...');
            const validationPromises = filteredRoutes.map(async (route) => {
                const fullUrl = toAbsoluteUrl(route.path);
                const isValid = await validateUrl(fullUrl);
                if (!isValid) {
                    console.warn(`❌ Invalid URL (non-200): ${fullUrl}`);
                }
                return isValid ? route : null;
            });

            const validationResults = await Promise.all(validationPromises);
            validatedRoutes = validationResults.filter(route => route !== null) as SitemapRoute[];

            if (validatedRoutes.length !== filteredRoutes.length) {
                console.log(`⚠️  ${filteredRoutes.length - validatedRoutes.length} URLs were excluded due to validation failures`);
            }
        }

        validatedRoutes.forEach((route, index) => {
            const isLast = index === validatedRoutes.length - 1;
            console.log(`${isLast ? ' └──' : ' ├──'} ${route.path}`);
        });

        console.log('\n');

        const urlsXml = validatedRoutes
            .map((route) => {
                const lastmod = route.lastmod || today;
                const priority = Math.max(0, Math.min(1, route.priority));
                return [
                    '  <url>',
                    `    <loc>${xmlEscape(toAbsoluteUrl(route.path))}</loc>`,
                    `    <lastmod>${lastmod}</lastmod>`,
                    `    <changefreq>${route.changefreq}</changefreq>`,
                    `    <priority>${priority.toFixed(1)}</priority>`,
                    '  </url>',
                ].join('\n');
            })
            .join('\n');

        const sitemap = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            '<!-- Generated by PPhat sitemap generator -->',
            urlsXml,
            '</urlset>',
            '',
        ].join('\n');

        const outputPath = join(process.cwd(), 'public/sitemap.xml');
        writeFileSync(outputPath, sitemap, 'utf-8');
        console.log(`✅ Sitemap generated successfully at ${outputPath}`);
        console.log(`🔗 Sitemap URL: ${getBaseUrl()}/sitemap.xml`);
        console.log(`📋 Total indexable pages: ${validatedRoutes.length}`);
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

// Run the generator
createSitemap().catch(error => {
    console.error('❌ Failed to create sitemap:', error);
    process.exit(1);
});
