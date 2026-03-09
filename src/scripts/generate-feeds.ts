import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { NEXT_PUBLIC_APP_URL, appDescriptions, appTitle } from '../lib/constants';

interface PostData {
    slug: string;
    title: string;
    description?: string;
    published: boolean;
    createdAt: string;
    updatedAt?: string;
}

interface PostsFile {
    posts: PostData[];
}

function xmlEscape(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function toRfc2822(value: string): string {
    return new Date(value).toUTCString();
}

function toIso(value: string): string {
    return new Date(value).toISOString();
}

function getBaseUrl(): string {
    const raw = NEXT_PUBLIC_APP_URL.trim();
    const parsed = new URL(raw);
    if (parsed.hostname.startsWith('www.')) {
        parsed.hostname = parsed.hostname.slice(4);
    }
    return parsed.toString().replace(/\/$/, '');
}

function readPublishedPosts(): PostData[] {
    const postsPath = join(process.cwd(), 'public/data/post.json');
    const data = JSON.parse(readFileSync(postsPath, 'utf-8')) as PostsFile;

    return data.posts
        .filter((post) => post.published)
        .sort((a, b) => {
            const aTime = new Date(a.updatedAt || a.createdAt).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt).getTime();
            return bTime - aTime;
        });
}

function buildRss(posts: PostData[], baseUrl: string): string {
    const feedUrl = `${baseUrl}/rss.xml`;
    const siteUrl = `${baseUrl}/posts`;
    const updated = posts[0]?.updatedAt || posts[0]?.createdAt || new Date().toISOString();

    const items = posts
        .map((post) => {
            const postUrl = `${baseUrl}/posts/${post.slug}`;
            const published = post.createdAt;
            const updatedAt = post.updatedAt || post.createdAt;
            const description = post.description || '';

            return [
                '  <item>',
                `    <title>${xmlEscape(post.title)}</title>`,
                `    <link>${xmlEscape(postUrl)}</link>`,
                `    <guid isPermaLink=\"true\">${xmlEscape(postUrl)}</guid>`,
                `    <pubDate>${toRfc2822(published)}</pubDate>`,
                `    <description>${xmlEscape(description)}</description>`,
                `    <dc:date>${toIso(updatedAt)}</dc:date>`,
                '  </item>',
            ].join('\n');
        })
        .join('\n');

    return [
        '<?xml version=\"1.0\" encoding=\"UTF-8\"?>',
        '<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">',
        '<channel>',
        `  <title>${xmlEscape(appTitle)}</title>`,
        `  <link>${xmlEscape(siteUrl)}</link>`,
        `  <description>${xmlEscape(appDescriptions)}</description>`,
        `  <language>en-US</language>`,
        `  <lastBuildDate>${toRfc2822(updated)}</lastBuildDate>`,
        `  <atom:link href=\"${xmlEscape(feedUrl)}\" rel=\"self\" type=\"application/rss+xml\" />`,
        items,
        '</channel>',
        '</rss>',
        '',
    ].join('\n');
}

function buildAtom(posts: PostData[], baseUrl: string): string {
    const feedUrl = `${baseUrl}/atom.xml`;
    const siteUrl = `${baseUrl}/posts`;
    const updated = posts[0]?.updatedAt || posts[0]?.createdAt || new Date().toISOString();

    const entries = posts
        .map((post) => {
            const postUrl = `${baseUrl}/posts/${post.slug}`;
            const summary = post.description || '';
            const published = post.createdAt;
            const updatedAt = post.updatedAt || post.createdAt;

            return [
                '  <entry>',
                `    <title>${xmlEscape(post.title)}</title>`,
                `    <id>${xmlEscape(postUrl)}</id>`,
                `    <link href=\"${xmlEscape(postUrl)}\" />`,
                `    <published>${toIso(published)}</published>`,
                `    <updated>${toIso(updatedAt)}</updated>`,
                `    <summary>${xmlEscape(summary)}</summary>`,
                '  </entry>',
            ].join('\n');
        })
        .join('\n');

    return [
        '<?xml version=\"1.0\" encoding=\"UTF-8\"?>',
        '<feed xmlns=\"http://www.w3.org/2005/Atom\">',
        `  <title>${xmlEscape(appTitle)}</title>`,
        `  <id>${xmlEscape(feedUrl)}</id>`,
        `  <link href=\"${xmlEscape(siteUrl)}\" rel=\"alternate\" />`,
        `  <link href=\"${xmlEscape(feedUrl)}\" rel=\"self\" />`,
        `  <updated>${toIso(updated)}</updated>`,
        `  <subtitle>${xmlEscape(appDescriptions)}</subtitle>`,
        entries,
        '</feed>',
        '',
    ].join('\n');
}

function buildJsonFeed(posts: PostData[], baseUrl: string): string {
    const feedUrl = `${baseUrl}/feed.json`;
    const siteUrl = `${baseUrl}/posts`;

    return JSON.stringify(
        {
            version: 'https://jsonfeed.org/version/1.1',
            title: appTitle,
            home_page_url: siteUrl,
            feed_url: feedUrl,
            description: appDescriptions,
            language: 'en-US',
            items: posts.map((post) => {
                const postUrl = `${baseUrl}/posts/${post.slug}`;
                return {
                    id: postUrl,
                    url: postUrl,
                    title: post.title,
                    summary: post.description || '',
                    date_published: toIso(post.createdAt),
                    date_modified: toIso(post.updatedAt || post.createdAt),
                };
            }),
        },
        null,
        2,
    );
}

export function generateFeeds(): void {
    const baseUrl = getBaseUrl();
    const posts = readPublishedPosts();

    const rss = buildRss(posts, baseUrl);
    const atom = buildAtom(posts, baseUrl);
    const jsonFeed = buildJsonFeed(posts, baseUrl);

    writeFileSync(join(process.cwd(), 'public/rss.xml'), rss, 'utf-8');
    writeFileSync(join(process.cwd(), 'public/atom.xml'), atom, 'utf-8');
    writeFileSync(join(process.cwd(), 'public/feed.json'), jsonFeed, 'utf-8');

    console.log(`✅ Generated feeds for ${posts.length} published posts.`);
    console.log(`🔗 RSS: ${baseUrl}/rss.xml`);
    console.log(`🔗 Atom: ${baseUrl}/atom.xml`);
    console.log(`🔗 JSON Feed: ${baseUrl}/feed.json`);
}

generateFeeds();
