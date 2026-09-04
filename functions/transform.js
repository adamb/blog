// Cloudflare Pages Function: POST /transform
// Uses Workers AI (free/cheap Neurons tier) + VISIT_LOG KV cache.

const MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';
const CACHE_TTL_SECONDS = 604800; // 1 week

const TONE_PROMPTS = {
  sarcastic:
    "Rewrite this blog post in a sarcastic tone. Make it dripping with sarcasm while keeping the main points intact. Use eye-rolling phrases and subtle mockery.",
  techbro:
    "Rewrite this blog post like a Silicon Valley tech bro. Use buzzwords like 'disrupting', 'synergy', 'paradigm shift', 'scale', 'iterate', 'MVP', 'growth hacking'. Be overly enthusiastic about technology and mention AI everywhere.",
  ubersnarky:
    "Rewrite this blog post with maximum snark and attitude. Be brutally sarcastic, condescending, and dismissive. Use phrases like 'Oh please', 'How original', 'Shocking revelation'. Make every sentence drip with disdain and eye-rolling contempt.",
  pirate:
    "Rewrite this blog post like a pirate. Use 'arrr', 'matey', 'ye', 'treasure', 'ship', 'sail the seven seas'. Make it adventurous and nautical.",
  academic:
    "Rewrite this blog post in an overly academic tone. Use complex vocabulary, cite imaginary studies, add unnecessary footnotes references, and make simple concepts sound impossibly complex.",
  clickbait:
    "Rewrite this blog post as clickbait. Use phrases like 'You Won't Believe', 'This One Trick', 'Number 7 Will Shock You', lots of caps and exclamation points.",
};

function generateSarcasticMock() {
  return [
    '# Oh, *Another* Blog Post 🙄',
    '',
    '*Because the internet definitely needed more of my thoughts...*',
    '',
    'So apparently I decided to write about stuff. **Shocking**, I know.',
    '',
    "*[Mock transformation for local development — Workers AI binding not available.]*",
  ].join('\n');
}

function generateTechBroMock() {
  return [
    '# 🚀 DISRUPTING THE BLOG SPACE WITH NEXT-GEN CONTENT',
    '',
    "*Leveraging synergistic paradigms to optimize thought leadership at scale*",
    '',
    "Hey **rockstars**! 💪 Ready to **10X** your understanding?",
    '',
    '*[Mock transformation for local development — Workers AI binding not available.]*',
  ].join('\n');
}

function generateUberSnarkyMock() {
  return [
    '# Oh Please, *Another* Groundbreaking Blog Post 🙄',
    '',
    '*Because the world was absolutely DYING for more of this riveting content...*',
    '',
    "How *original*. Shocking revelation, really.",
    '',
    '*[Mock transformation for local development — Workers AI binding not available.]*',
  ].join('\n');
}

function mockForTone(tone) {
  switch (tone) {
    case 'techbro':
      return generateTechBroMock();
    case 'ubersnarky':
      return generateUberSnarkyMock();
    default:
      return generateSarcasticMock();
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function cacheKeyFor(tone, content) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${tone}::${content}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'ai_transform_' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  try {
    let tone;
    let content;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await request.json();
      tone = data.tone;
      content = data.content;
    } else {
      const formData = await request.formData();
      tone = formData.get('tone');
      content = formData.get('content');
    }

    if (!tone || !content) {
      return jsonResponse({ error: 'Tone and content are required' }, 400);
    }

    // Local / preview without AI binding: return mock
    if (!env.AI) {
      return jsonResponse({
        originalContent: content,
        transformedContent: mockForTone(tone),
        tone,
      });
    }

    const cacheKey = await cacheKeyFor(tone, content);

    if (env.VISIT_LOG) {
      const cached = await env.VISIT_LOG.get(cacheKey);
      if (cached) {
        const cachedResponse = JSON.parse(cached);
        return jsonResponse({
          originalContent: content,
          transformedContent: cachedResponse.transformedContent,
          tone,
        });
      }
    }

    const systemPrompt = TONE_PROMPTS[tone] || TONE_PROMPTS.sarcastic;
    const fullPrompt = `${systemPrompt}

Original post:
${content}

Please rewrite the entire post maintaining the same structure and key information, but completely change the tone as requested. Keep any code blocks or technical details accurate.`;

    console.log(`Starting AI transformation model=${MODEL} tone=${tone} len=${content.length}`);
    const startTime = Date.now();

    const aiResponse = await env.AI.run(MODEL, {
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that transforms text into different tones and styles.',
        },
        { role: 'user', content: fullPrompt },
      ],
      max_tokens: 2048,
    });

    const transformed =
      typeof aiResponse === 'string'
        ? aiResponse
        : aiResponse?.response ?? '';

    if (!transformed) {
      throw new Error('Empty response from Workers AI');
    }

    if (env.VISIT_LOG) {
      await env.VISIT_LOG.put(
        cacheKey,
        JSON.stringify({
          transformedContent: transformed,
          cachedAt: new Date().toISOString(),
          model: MODEL,
        }),
        { expirationTtl: CACHE_TTL_SECONDS }
      );
    }

    console.log(`AI transformation completed in ${Date.now() - startTime}ms`);

    return jsonResponse({
      originalContent: content,
      transformedContent: transformed,
      tone,
    });
  } catch (error) {
    console.error('AI transformation error:', error);
    return jsonResponse(
      {
        error: 'Failed to transform content',
        details: error.message,
      },
      500
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
