// Serves /ga.js — emits GA4 gtag loader only when GA_MEASUREMENT_ID is set
// as a Cloudflare Pages secret and matches /^G-[A-Z0-9]+$/. Otherwise no-op.
// Never commit a measurement ID. Admin/noindex pages must not load this script.

const GA_ID_RE = /^G-[A-Z0-9]+$/;

export async function onRequestGet({ env }) {
  const id = (env.GA_MEASUREMENT_ID || '').trim();
  const headers = {
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  };

  if (!GA_ID_RE.test(id)) {
    return new Response('/* GA not configured */\n', { headers });
  }

  const script = `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)});
(function(){
  var s=document.createElement('script');
  s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(${JSON.stringify(id)});
  document.head.appendChild(s);
})();
`;

  return new Response(script, { headers });
}
