export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
      return new Response(JSON.stringify({ error: 'Path parameter is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Check if KV binding is available
    if (!env.VISIT_LOG) {
      return new Response(JSON.stringify({ path, visits: 0, error: 'KV not available' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Get the visit count for this path
    const pathKey = `path:${path}`;
    const visitCount = await env.VISIT_LOG.get(pathKey);
    const visits = visitCount ? parseInt(visitCount) : 0;
    
    // Check if the request wants HTML (from HTMX) or JSON
    const acceptHeader = request.headers.get('Accept') || '';
    const wantsHTML = acceptHeader.includes('text/html') || request.headers.get('HX-Request');
    
    if (wantsHTML) {
      // Return HTML fragment for HTMX
      const visitText = visits === 1 ? '1 visit' : `${visits} visits`;
      const html = `<span class="visit-count">👁️ ${visitText}</span>`;
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      // Return JSON for API calls
      return new Response(JSON.stringify({ path, visits }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
  } catch (error) {
    console.error('Error fetching visit count:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}