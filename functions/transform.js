export async function onRequestPost({ request, env }) {
  try {
    let tone, content;
    
    // Handle both JSON and form data
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await request.json();
      tone = data.tone;
      content = data.content;
    } else {
      // Handle form-encoded data from HTMX
      const formData = await request.formData();
      tone = formData.get('tone');
      content = formData.get('content');
    }
    
    if (!tone || !content) {
      return new Response(JSON.stringify({ error: 'Tone and content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if AI binding is available (won't be in local dev)
    if (!env.AI) {
      // Return a mock response for local development
      const mockResponse = `🤖 **${tone.toUpperCase()} VERSION** (Mock Response)\n\n${content.substring(0, 200)}... *[This would be transformed by Cloudflare AI in production]*`;
      
      return new Response(JSON.stringify({ 
        originalContent: content,
        transformedContent: mockResponse,
        tone: tone 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Define tone prompts
    const tonePrompts = {
      sarcastic: "Rewrite this blog post in a sarcastic tone. Make it dripping with sarcasm while keeping the main points intact. Use eye-rolling phrases and subtle mockery.",
      
      techbro: "Rewrite this blog post like a Silicon Valley tech bro. Use buzzwords like 'disrupting', 'synergy', 'paradigm shift', 'scale', 'iterate', 'MVP', 'growth hacking'. Be overly enthusiastic about technology and mention AI everywhere.",
      
      valleygirl: "Rewrite this blog post like a 90s Valley Girl. Use phrases like 'like totally', 'as if', 'whatever', 'gag me with a spoon'. Make it super bubbly and use lots of 'like' and 'totally'.",
      
      pirate: "Rewrite this blog post like a pirate. Use 'arrr', 'matey', 'ye', 'treasure', 'ship', 'sail the seven seas'. Make it adventurous and nautical.",
      
      academic: "Rewrite this blog post in an overly academic tone. Use complex vocabulary, cite imaginary studies, add unnecessary footnotes references, and make simple concepts sound impossibly complex.",
      
      clickbait: "Rewrite this blog post as clickbait. Use phrases like 'You Won't Believe', 'This One Trick', 'Number 7 Will Shock You', lots of caps and exclamation points."
    };

    const systemPrompt = tonePrompts[tone] || tonePrompts.sarcastic;
    
    const fullPrompt = `${systemPrompt}

Original post:
${content}

Please rewrite the entire post maintaining the same structure and key information, but completely change the tone as requested. Keep any code blocks or technical details accurate.`;

    // Call Cloudflare AI
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that transforms text into different tones and styles.' },
        { role: 'user', content: fullPrompt }
      ],
      max_tokens: 2048
    });

    return new Response(JSON.stringify({
      originalContent: content,
      transformedContent: aiResponse.response,
      tone: tone
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI transformation error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to transform content',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}