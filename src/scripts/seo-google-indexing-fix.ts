type CheckResult = {
	service: string;
	ok: boolean;
	details: string;
};

type ServiceNote = {
	service: string;
	details: string;
};

const GOOGLE_PING_REMOVED_NOTE =
	'Google no longer supports the public sitemap ping endpoint. Submit or refresh sitemap in Google Search Console instead.';

const BING_PING_REMOVED_NOTE =
	'Bing legacy sitemap ping endpoints may return 410. Use Bing Webmaster Tools or IndexNow instead.';

function resolveBaseUrl(): string {
	return (process.env.SEO_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.pphat.me').replace(/\/$/, '');
}

function getServiceNotes(sitemapUrl: string): ServiceNote[] {
	const encodedSitemapUrl = encodeURIComponent(sitemapUrl);

	return [
		{
			service: 'Google',
			details: `${GOOGLE_PING_REMOVED_NOTE} Search Console: https://search.google.com/search-console`,
		},
		{
			service: 'Bing',
			details: `${BING_PING_REMOVED_NOTE} Webmaster Tools: https://www.bing.com/webmasters/about`,
		},
		{
			service: 'Manual Check',
			details: `Validate sitemap in browser: ${sitemapUrl} | Encoded URL: ${encodedSitemapUrl}`,
		},
	];
}

async function verifySitemapReachability(sitemapUrl: string): Promise<CheckResult> {
	try {
		const headResponse = await fetch(sitemapUrl, { method: 'HEAD' });

		if (headResponse.ok) {
			return {
				service: 'Sitemap URL',
				ok: true,
				details: `Reachable (${headResponse.status})`,
			};
		}

		// Fallback for hosts that do not support HEAD well.
		const getResponse = await fetch(sitemapUrl, { method: 'GET' });
		return {
			service: 'Sitemap URL',
			ok: getResponse.ok,
			details: getResponse.ok
				? `Reachable with GET (${getResponse.status})`
				: `Not reachable (${getResponse.status})`,
		};
	} catch (error) {
		return {
			service: 'Sitemap URL',
			ok: false,
			details: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

async function tryIndexNowSubmission(sitemapUrl: string): Promise<CheckResult> {
	const indexNowKey = process.env.INDEXNOW_KEY;
	const endpoint = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';

	if (!indexNowKey) {
		return {
			service: 'IndexNow',
			ok: true,
			details: 'Skipped (set INDEXNOW_KEY to enable automatic submission)',
		};
	}

	try {
		const host = new URL(sitemapUrl).hostname;

		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				host,
				key: indexNowKey,
				urlList: [sitemapUrl],
			}),
		});

		if (!response.ok) {
			return {
				service: 'IndexNow',
				ok: false,
				details: `Request failed (${response.status})`,
			};
		}

		return {
			service: 'IndexNow',
			ok: true,
			details: `Submitted (${response.status})`,
		};
	} catch (error) {
		return {
			service: 'IndexNow',
			ok: false,
			details: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

export async function runIndexingFix(): Promise<void> {
	const baseUrl = resolveBaseUrl();
	const sitemapUrl = `${baseUrl}/sitemap.xml`;

	console.log(`Checking sitemap indexing readiness for: ${sitemapUrl}`);
	console.log('----------------------------------------');

	const checks = await Promise.all([
		verifySitemapReachability(sitemapUrl),
		tryIndexNowSubmission(sitemapUrl),
	]);

	checks.forEach((check) => {
		const icon = check.ok ? '✅' : '❌';
		console.log(`${icon} ${check.service} - ${check.details}`);
	});

	getServiceNotes(sitemapUrl).forEach((note) => {
		console.log(`ℹ️  ${note.service} - ${note.details}`);
	});

	const strictMode = process.env.STRICT_INDEXING_CHECK === 'true';
	const hasFailure = checks.some((check) => !check.ok);
	if (strictMode && hasFailure) {
		process.exit(1);
	}
}

if (require.main === module) {
	runIndexingFix().catch((error) => {
		console.error('❌ Indexing script failed:', error);
		process.exit(1);
	});
}
