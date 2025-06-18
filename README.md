# HTMX Static Blog with AI Content Transformation

A static blog built with HTMX that generates HTML from markdown files and includes AI-powered content transformation features.

## Core Features

- **Static Site Generation**: Converts markdown files to HTML with dynamic navigation
- **HTMX Integration**: SPA-like navigation without page reloads
- **AI Content Transformation**: Transform blog posts into different tones using Cloudflare Workers AI
- **Visit Tracking**: Analytics using Cloudflare KV storage
- **Caching**: KV-based caching for AI transformations (1-week TTL)
- **Static Pages**: Support for non-blog pages like About

## Architecture

### File Structure
```
blog/
├── index_template.html     ← Base template with NAV_LINKS and MAIN_CONTENT placeholders
├── build.js               ← Build script that processes markdown → HTML
├── package.json           ← Dependencies (markdown-it)
├── posts_src/             ← Source markdown files for blog posts (use "# Title" as first line)
├── pages/                 ← Source markdown files for static pages (like about)
├── posts/                 ← Generated HTML files (auto-created)
├── assets/style.css       ← Styling
├── functions/             ← Cloudflare Pages Functions
│   ├── transform.js       ← AI transformation endpoint
│   ├── track.js           ← Visit tracking
│   └── visits.js          ← Visit counter API
└── wrangler.toml          ← Cloudflare configuration
```

### Build Process

1. **Content Creation**: 
   - Write blog posts as markdown in `posts_src/`
   - Write static pages as markdown in `pages/`
2. **Build**: `npm run build` converts markdown to HTML using markdown-it
3. **Template Processing**: 
   - Wraps blog posts in `<article>` tags with AI transformation controls
   - Generates static pages at root level (e.g., `/about.html`)
   - Creates full HTML pages using `index_template.html`
4. **Navigation**: Creates dynamic nav links with HTMX attributes

### HTMX Navigation

Links use HTMX for seamless content loading:
- `hx-get` for fetching content
- `hx-select="article"` to extract article content
- `hx-target="#content"` for content replacement
- `hx-push-url="true"` for URL updates

### AI Transformation System

The transform feature allows readers to rewrite blog posts in different tones:

**Available Tones:**
- **Sarcastic**: Dripping with sarcasm and subtle mockery
- **Tech Bro**: Silicon Valley buzzwords and excessive enthusiasm
- **Uber Snarky**: Maximum attitude with condescending contempt

**How it works:**
1. User clicks tone button on any post
2. JavaScript calls `/functions/transform` endpoint
3. Function creates SHA-256 cache key from `tone + content`
4. Checks Cloudflare KV for cached response
5. If not cached, calls Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct)
6. Caches response in KV with 1-week expiration
7. Returns transformed content to update the page

**Caching Strategy:**
- Cache key: `ai_transform_[SHA-256 hash of tone::content]`
- Storage: Cloudflare KV (VISIT_LOG namespace)
- TTL: 1 week (`expirationTtl: 604800`)
- Cache hits return instantly without AI calls

### Cloudflare Pages Setup

- **Functions**: Serverless endpoints in `/functions/`
- **KV Storage**: `VISIT_LOG` namespace for caching and analytics
- **Workers AI**: LLM integration for content transformation
- **Environment**: Separate preview/production configurations

## Development

### Build Commands
- `npm run build` - Converts markdown files to HTML and regenerates index.html

### Local Development
- Functions run locally with mock responses when AI binding unavailable
- KV storage provides caching in both preview and production environments

### Deployment
- Deploy to Cloudflare Pages
- Requires KV namespace and Workers AI bindings configured in wrangler.toml