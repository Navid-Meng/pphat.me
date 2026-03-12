import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, getPostBySlug, invalidateCache, type PostEntry } from '@lib/content';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface Params {
    params: Promise<{ id: string; }>;
}

function getMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        case '.gif':
            return 'image/gif';
        case '.svg':
            return 'image/svg+xml';
        default:
            return 'application/octet-stream';
    }
}

export async function GET(request: NextRequest, props: Params) {
    const params = await props.params;
    try {
        // Try by slug first, then by id
        const post = getPostBySlug(params.id) ?? getAllPosts().find(p => p.id === params.id);

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const assetName = request.nextUrl.searchParams.get('asset');
        if (assetName) {
            const safeAssetName = path.basename(assetName);
            const postDir = path.join(process.cwd(), 'content', 'posts', post.slug);
            const assetPath = path.join(postDir, safeAssetName);

            if (safeAssetName !== assetName || !fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
                return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
            }

            const fileBuffer = fs.readFileSync(assetPath);

            return new NextResponse(new Uint8Array(fileBuffer), {
                headers: {
                    'Content-Type': getMimeType(assetPath),
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

function writePostToFile(post: PostEntry, markdownContent: string) {
    const dir = path.join(process.cwd(), 'content', 'posts', post.slug);
    fs.mkdirSync(dir, { recursive: true });

    const frontmatter: Record<string, unknown> = {
        title: post.title,
        slug: post.slug,
        description: post.description,
        tags: post.tags,
        authors: post.authors,
        thumbnail: post.thumbnail,
        published: post.published,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    };

    const fileContent = matter.stringify(markdownContent, frontmatter);
    fs.writeFileSync(path.join(dir, 'index.md'), fileContent, 'utf8');
    invalidateCache();
}

export async function PUT(request: NextRequest, props: Params) {
    const params = await props.params;
    try {
        const body = await request.json();

        const existingPost = getPostBySlug(params.id) ?? getAllPosts().find(p => p.id === params.id);
        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (body.title && typeof body.title !== 'string') {
            return NextResponse.json({ error: 'Title must be a string' }, { status: 400 });
        }

        const updatedPost: PostEntry = {
            ...existingPost,
            ...body,
            id: existingPost.id,
            createdAt: existingPost.createdAt,
            updatedAt: new Date().toISOString(),
            slug: existingPost.slug, // Keep original slug to avoid breaking URLs
        };

        writePostToFile(updatedPost, body.content || existingPost.content);

        return NextResponse.json({
            message: 'Post updated successfully',
            data: updatedPost
        });
    } catch (error) {
        console.error('Error updating post:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, props: Params) {
    const params = await props.params;
    try {
        const existingPost = getPostBySlug(params.id) ?? getAllPosts().find(p => p.id === params.id);
        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const dir = path.join(process.cwd(), 'content', 'posts', existingPost.slug);
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true });
        }
        invalidateCache();

        return NextResponse.json({
            message: 'Post deleted successfully',
            success: true
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, props: Params) {
    const params = await props.params;
    try {
        const body = await request.json();

        const existingPost = getPostBySlug(params.id) ?? getAllPosts().find(p => p.id === params.id);
        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const updates: Partial<PostEntry> = {};

        if (body.title !== undefined) {
            if (typeof body.title !== 'string' || body.title.trim().length === 0) {
                return NextResponse.json({ error: 'Title must be a non-empty string' }, { status: 400 });
            }
            updates.title = body.title.trim();
        }
        if (body.content !== undefined) updates.content = body.content;
        if (body.published !== undefined) updates.published = Boolean(body.published);
        if (body.description !== undefined) updates.description = String(body.description).trim();
        if (body.tags !== undefined && Array.isArray(body.tags)) updates.tags = body.tags;
        if (body.authors !== undefined && Array.isArray(body.authors)) updates.authors = body.authors;
        if (body.thumbnail !== undefined) updates.thumbnail = String(body.thumbnail).trim();

        const updatedPost: PostEntry = {
            ...existingPost,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        writePostToFile(updatedPost, updatedPost.content);

        return NextResponse.json({
            message: 'Post updated successfully',
            data: updatedPost
        });
    } catch (error) {
        console.error('Error updating post:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}