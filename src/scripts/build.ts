#!/usr/bin/env node

import { performance } from 'perf_hooks';

const startTime = performance.now();

console.log("\x1b[36m%s\x1b[0m", "🚀 Starting build process...");
console.log("\x1b[33m%s\x1b[0m", "⚡ Loading configurations...");
console.log("\n");

// Use new sitemap generator

const startSitemap = performance.now();
export { createSitemap } from './generate-sitemap';
const endSitemap = performance.now();
console.log(`\n⌛ Total Sitemap generated time: ${(endSitemap - startSitemap).toFixed(2)} ms`);
console.log("\x1b[32m%s\x1b[0m", "✨ Sitemap generated successfully!\n");

const startImageSitemap = performance.now();
export { generateImageSitemap } from "./generate-images-sitemap";
const endImageSitemap = performance.now();
console.log(`\n⌛ Total Image sitemap generatedtime: ${(endImageSitemap - startImageSitemap).toFixed(2)} ms`);
console.log("\x1b[32m%s\x1b[0m", "✨ Image sitemap generated successfully!\n");


const startManifest = performance.now();
export { generateManifest } from "./generate-manifest";
const endManifest = performance.now();
console.log(`\n⌛ Total Manifest generated time: ${(endManifest - startManifest).toFixed(2)} ms`);
console.log("\x1b[32m%s\x1b[0m", "✨ Manifest generated successfully!\n");

const startFeeds = performance.now();
export { generateFeeds } from "./generate-feeds";
const endFeeds = performance.now();
console.log(`\n⌛ Total Feed generated time: ${(endFeeds - startFeeds).toFixed(2)} ms`);
console.log("\x1b[32m%s\x1b[0m", "✨ RSS/Atom/JSON feeds generated successfully!\n");


const endTime = performance.now();
const executionTime = endTime - startTime;
if (executionTime < 500) {
    console.log("\x1b[32m%s\x1b[0m", `\n⌛ Total execution time: ${executionTime.toFixed(2)} ms`);
} else {
    console.log("\x1b[33m%s\x1b[0m", `\n⌛ Total execution time: ${executionTime.toFixed(2)} ms`);
}