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
      // Generate a realistic mock response that mimics AI transformation
      let mockResponse;
      
      switch(tone) {
        case 'sarcastic':
          mockResponse = generateSarcasticMock(content);
          break;
        case 'techbro':
          mockResponse = generateTechBroMock(content);
          break;
        case 'ubersnarky':
          mockResponse = generateUberSnarkyMock(content);
          break;
        default:
          mockResponse = generateSarcasticMock(content);
      }
      
      return new Response(JSON.stringify({ 
        originalContent: content,
        transformedContent: mockResponse,
        tone: tone 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

function generateSarcasticMock(content) {
  // Take the first few lines and add sarcastic flair
  const lines = content.split('\n').slice(0, 10);
  let mock = "# Oh, *Another* Blog Post 🙄\n\n";
  mock += "*Because the internet definitely needed more of my thoughts...*\n\n";
  mock += "So apparently I decided to write about stuff. **Shocking**, I know.\n\n";
  mock += "Here's what this *incredibly important* post covers:\n\n";
  mock += "- Some thing I think is cool (it's probably not)\n";
  mock += "- Technical details that **totally** matter\n";
  mock += "- My *expert* opinions on things\n\n";
  mock += "## The *\"Brilliant\"* Details\n\n";
  mock += "Look, I could explain this in detail, but let's be honest - you're probably just skimming anyway. ";
  mock += "This is where I'd normally put some **groundbreaking** insights, but instead you get this sarcastic placeholder.\n\n";
  mock += "*[This is a mock transformation for local development. The real AI would be much more... creative.]*";
  return mock;
}

function generateTechBroMock(content) {
  let mock = "# 🚀 DISRUPTING THE BLOG SPACE WITH NEXT-GEN CONTENT\n\n";
  mock += "*Leveraging synergistic paradigms to optimize thought leadership at scale*\n\n";
  mock += "Hey **rockstars**! 💪 I'm super excited to share some game-changing insights that are going to totally revolutionize how you think about this space.\n\n";
  mock += "## Key Takeaways That Will 10X Your Understanding:\n\n";
  mock += "- **Disrupting** traditional content consumption patterns\n";
  mock += "- **Scaling** intellectual property through viral ideation\n";
  mock += "- **Optimizing** engagement metrics via authentic storytelling\n";
  mock += "- **Iterating** on feedback loops to achieve product-market fit\n\n";
  mock += "This isn't just content - it's a **movement**. We're not just writing, we're building the future of human connection through AI-powered narrative experiences.\n\n";
  mock += "Ready to **crush it** together? Let's **ship** some knowledge! 🔥\n\n";
  mock += "*[Mock transformation - the real AI would add even more buzzwords!]*";
  return mock;
}

function generateUberSnarkyMock(content) {
  let mock = "# Oh Please, *Another* Groundbreaking Blog Post 🙄\n\n";
  mock += "*Because the world was absolutely DYING for more of this riveting content...*\n\n";
  mock += "Well, well, well. Look who decided to grace the internet with their **profound** insights. ";
  mock += "How *original*. I'm sure nobody has ever thought of writing about this before. Shocking revelation, really.\n\n";
  mock += "## \"Revolutionary\" Points That Will *Totally* Change Your Life:\n\n";
  mock += "- Some earth-shattering observation (spoiler: it's not)\n";
  mock += "- Technical details that are **so** fascinating (yawn)\n";
  mock += "- \"Expert\" opinions that definitely matter (sure they do)\n\n";
  mock += "Oh, I could absolutely elaborate on all this *groundbreaking* material, but let's be honest - ";
  mock += "you're probably just skimming anyway. Why waste perfectly good snark on people who won't even finish reading?\n\n";
  mock += "There you have it. Another blog post for the pile. You're welcome, internet. 💅\n\n";
  mock += "*[This is a mock transformation with maximum attitude. The real AI would be even more delightfully snarky!]*";
  return mock;
}

    // Define tone prompts
    const tonePrompts = {
      sarcastic: "Rewrite this blog post in a sarcastic tone. Make it dripping with sarcasm while keeping the main points intact. Use eye-rolling phrases and subtle mockery.",
      
      techbro: "Rewrite this blog post like a Silicon Valley tech bro. Use buzzwords like 'disrupting', 'synergy', 'paradigm shift', 'scale', 'iterate', 'MVP', 'growth hacking'. Be overly enthusiastic about technology and mention AI everywhere.",
      
      ubersnarky: "Rewrite this blog post with maximum snark and attitude. Be brutally sarcastic, condescending, and dismissive. Use phrases like 'Oh please', 'How original', 'Shocking revelation'. Make every sentence drip with disdain and eye-rolling contempt.",
      
      pirate: "Rewrite this blog post like a pirate. Use 'arrr', 'matey', 'ye', 'treasure', 'ship', 'sail the seven seas'. Make it adventurous and nautical.",
      
      academic: "Rewrite this blog post in an overly academic tone. Use complex vocabulary, cite imaginary studies, add unnecessary footnotes references, and make simple concepts sound impossibly complex.",
      
      clickbait: "Rewrite this blog post as clickbait. Use phrases like 'You Won't Believe', 'This One Trick', 'Number 7 Will Shock You', lots of caps and exclamation points."
    };

    const systemPrompt = tonePrompts[tone] || tonePrompts.sarcastic;
    
    const fullPrompt = `${systemPrompt}

Original post:
${content}

Please rewrite the entire post maintaining the same structure and key information, but completely change the tone as requested. Keep any code blocks or technical details accurate.`;

    // Create cache key from tone and content hash
    const cacheInput = tone + '::' + content;
    const encoder = new TextEncoder();
    const data = encoder.encode(cacheInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const cacheKey = 'ai_transform_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache first
    console.log(`Checking cache for key: ${cacheKey}`);
    const cached = await env.VISIT_LOG.get(cacheKey);
    
    if (cached) {
      console.log('🚀 CACHE HIT - Returning cached response');
      const cachedResponse = JSON.parse(cached);
      return new Response(JSON.stringify({
        originalContent: content,
        transformedContent: cachedResponse.transformedContent,
        tone: tone
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call Cloudflare AI with timing logging
    console.log(`Starting AI transformation for tone: ${tone}, content length: ${content.length}`);
    const startTime = Date.now();
    
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that transforms text into different tones and styles.' },
        { role: 'user', content: fullPrompt }
      ],
      max_tokens: 2048
    });
    
    // Cache the response for 24 hours
    const cacheData = {
      transformedContent: aiResponse.response,
      cachedAt: new Date().toISOString()
    };
    await env.VISIT_LOG.put(cacheKey, JSON.stringify(cacheData), {
      expirationTtl: 604800  // 1 week (7 * 24 * 60 * 60 seconds)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`AI transformation completed in ${duration}ms`);
    console.log(`Response length: ${aiResponse.response?.length || 0} characters`);
    
    // Log if this was likely a cache hit (very fast response)
    if (duration < 500) {
      console.log('🚀 LIKELY CACHE HIT - Very fast response (<500ms)');
    } else if (duration < 2000) {
      console.log('⚡ POSSIBLE CACHE HIT - Fast response (<2s)');
    } else {
      console.log('🔄 LIKELY NEW AI CALL - Slower response (>2s)');
    }

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