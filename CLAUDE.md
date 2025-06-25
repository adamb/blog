# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run build` - Converts markdown files in `posts_src/` to HTML in `dist/` and regenerates `index.html`
- `npm run build:drafts` - Same as build but includes draft posts (equivalent to `node build.js --buildDrafts`)

## Draft Posts

Posts can be marked as drafts by adding `draft: true` to the frontmatter. Draft posts are excluded from builds by default but can be included using the `--buildDrafts` or `-D` flag. Draft posts are visually marked with a "DRAFT" badge when included in builds.

## Architecture

This is a static blog built with HTMX that generates HTML from markdown files with AI-powered content transformation features. The core workflow:

1. **Content Creation**: Write posts as markdown files in `posts_src/` (static pages go in `pages/`)
2. **Build Process**: `build.js` converts markdown to HTML using markdown-it, wraps content in `<article>` tags with AI transformation controls, and generates full HTML pages using `index_template.html` as the base template
3. **Navigation**: Builds dynamic navigation links with HTMX attributes for SPA-like behavior
4. **AI Transformation**: Posts can be transformed into different tones (sarcastic, tech bro, uber snarky) using Cloudflare Workers AI
5. **Deployment**: Uses Cloudflare Pages with KV storage for visit tracking and AI transformation caching

### Key Files

- `build.js` - Main build script that processes markdown and generates HTML
- `index_template.html` - Base template with `<!-- NAV_LINKS -->` and `<!-- MAIN_CONTENT -->` placeholders
- `posts_src/*.md` - Source markdown files for blog posts (use `# Title` for the first line to set page title)
- `pages/*.md` - Source markdown files for static pages (like about)
- `dist/` - Generated HTML files and assets (auto-created, don't edit directly)
- `functions/track.js` - Cloudflare Pages function for visit tracking
- `functions/transform.js` - AI transformation endpoint with caching
- `functions/visits.js` - Visit counter API
- `functions/stats.js` - Analytics endpoint
- `admin.js` - Analytics worker (separate from main blog)

### HTMX Integration

Navigation uses HTMX for dynamic content loading:
- Links use `hx-get`, `hx-select="article"`, `hx-target="#content"`, and `hx-push-url="true"`
- Supports both HTMX navigation and direct URL access

### AI Transformation System

Posts include transformation buttons that allow readers to rewrite content in different tones:
- **Sarcastic**: Dripping with sarcasm and subtle mockery
- **Tech Bro**: Silicon Valley buzzwords and excessive enthusiasm  
- **Uber Snarky**: Maximum attitude with condescending contempt

Transformations use Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct) with KV caching:
- Cache key: `ai_transform_[SHA-256 hash of tone::content]`
- TTL: 1 week to reduce AI API calls
- Functions provide mock responses when AI binding unavailable (local dev)

### Cloudflare Pages Setup

- Uses `wrangler.toml` for configuration
- KV namespace `VISIT_LOG` for tracking and AI caching (different bindings for preview/production)
- Workers AI binding for content transformation
- Functions at `/functions/` provide API endpoints for tracking, analytics, and AI transformation