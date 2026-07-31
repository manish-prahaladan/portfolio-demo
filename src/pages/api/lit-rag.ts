import type { APIRoute } from 'astro';

export const prerender = false;

const jsonResponse = (body: unknown, status: number) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
		},
	});

export const POST: APIRoute = async ({ request, locals }) => {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return jsonResponse({ detail: 'Request body must be valid JSON.' }, 400);
	}

	const runtimeLocals = locals as typeof locals & {
		runtime?: {
			env?: {
				LIT_RAG_API_URL?: string;
			};
		};
	};
	const configuredUrl =
		import.meta.env.LIT_RAG_API_URL || runtimeLocals.runtime?.env?.LIT_RAG_API_URL;
	const apiBaseUrl = configuredUrl?.replace(/\/+$/, '');
	if (!apiBaseUrl) {
		return jsonResponse({ detail: 'The Literature RAG service is not configured.' }, 503);
	}

	try {
		const response = await fetch(`${apiBaseUrl}/ask`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const responseBody = await response.text();

		return new Response(
			responseBody || JSON.stringify({ detail: 'The Literature RAG service returned no data.' }),
			{
				status: response.status,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store',
				},
			},
		);
	} catch (error) {
		console.error('Literature RAG upstream request failed', error);
		return jsonResponse({ detail: 'The Literature RAG service is temporarily unavailable.' }, 502);
	}
};
