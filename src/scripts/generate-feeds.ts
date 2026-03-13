import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { NEXT_PUBLIC_APP_URL, appDescriptions, appTitle } from '../lib/constants';

interface PostData {
    slug: string;
    title: string;
    description?: string;
    thumbnail?: string;
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

function toCdata(value: string): string {
    // Split embedded CDATA terminators to keep valid XML.
    return `<![CDATA[${value.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
}

function toRfc2822(value: string): string {
    return new Date(value).toUTCString();
}

function toIso(value: string): string {
    return new Date(value).toISOString();
}

function getImageMimeType(imageUrl: string): string {
    const cleanUrl = imageUrl.split('?')[0].toLowerCase();
    if (cleanUrl.endsWith('.png')) return 'image/png';
    if (cleanUrl.endsWith('.gif')) return 'image/gif';
    if (cleanUrl.endsWith('.webp')) return 'image/webp';
    if (cleanUrl.endsWith('.svg')) return 'image/svg+xml';
    return 'image/jpeg';
}

function getBaseUrl(): string {
    const raw = NEXT_PUBLIC_APP_URL.trim();
    const parsed = new URL(raw);
    if (parsed.hostname.startsWith('www.')) {
        parsed.hostname = parsed.hostname.slice(4);
    }
    return parsed.toString().replace(/\/$/, '');
}

function parseFrontmatter(content: string): Record<string, unknown> {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return {};
    const yaml = match[1];
    const data: Record<string, unknown> = {};
    for (const line of yaml.split('\n')) {
        const m = line.match(/^(\w+):\s*(.+)/);
        if (m) {
            let val: unknown = m[2].trim();
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            data[m[1]] = val;
        }
    }
    return data;
}

function findMarkdownFilesInDir(dir: string): string[] {
    if (!existsSync(dir)) return [];
    const results: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) results.push(...findMarkdownFilesInDir(fullPath));
        else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) results.push(fullPath);
    }
    return results;
}

function readPublishedPosts(): PostData[] {
    const postsDir = join(process.cwd(), 'content', 'posts');
    const files = findMarkdownFilesInDir(postsDir);
    const posts: PostData[] = [];

    for (const file of files) {
        const raw = readFileSync(file, 'utf-8');
        const data = parseFrontmatter(raw);
        if (data.published !== true) continue;

        posts.push({
            slug: data.slug as string || '',
            title: data.title as string || '',
            description: data.description as string || '',
            thumbnail: data.thumbnail as string || '',
            published: true,
            createdAt: data.createdAt as string || '',
            updatedAt: data.updatedAt as string || undefined,
        });
    }

    return posts.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt).getTime();
        return bTime - aTime;
    });
}

function buildRss(posts: PostData[], baseUrl: string): string {
    const feedUrl = `${baseUrl}/rss.xml`;
    const siteUrl = `${baseUrl}/posts`;
    const channelImageUrl = `${baseUrl}/assets/icons/android-chrome-512x512.png`;
    const updated = posts[0]?.updatedAt || posts[0]?.createdAt || new Date().toISOString();

    const items = posts
        .map((post) => {
            const postUrl = `${baseUrl}/posts/${post.slug}`;
            const published = post.createdAt;
            const updatedAt = post.updatedAt || post.createdAt;
            const description = post.description || '';
            const thumbnail = post.thumbnail || channelImageUrl;
            const imageType = getImageMimeType(thumbnail);

            return [
                '  <item>',
                `    <title>${toCdata(post.title)}</title>`,
                `    <link>${xmlEscape(postUrl)}</link>`,
                `    <guid isPermaLink=\"true\">${xmlEscape(postUrl)}</guid>`,
                `    <pubDate>${toRfc2822(published)}</pubDate>`,
                `    <description>${toCdata(description)}</description>`,
                `    <enclosure url=\"${xmlEscape(thumbnail)}\" length=\"0\" type=\"${imageType}\" />`,
                `    <media:content url=\"${xmlEscape(thumbnail)}\" medium=\"image\" type=\"${imageType}\" />`,
                `    <media:thumbnail url=\"${xmlEscape(thumbnail)}\" />`,
                `    <dc:date>${toIso(updatedAt)}</dc:date>`,
                '  </item>',
            ].join('\n');
        })
        .join('\n');

    return [
        '<?xml version=\"1.0\" encoding=\"UTF-8\"?>',
        '<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:media=\"http://search.yahoo.com/mrss/\">',
        '<channel>',
        `  <title>${toCdata(appTitle)}</title>`,
        `  <link>${xmlEscape(siteUrl)}</link>`,
        `  <description>${toCdata(appDescriptions)}</description>`,
        `  <language>en-US</language>`,
        '  <image>',
        `    <url>${xmlEscape(channelImageUrl)}</url>`,
        `    <title>${toCdata(appTitle)}</title>`,
        `    <link>${xmlEscape(baseUrl)}</link>`,
        '  </image>',
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
