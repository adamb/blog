# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run build` - Converts markdown files in `posts_src/` to HTML in `posts/` and regenerates `index.html`
- `npm run build:drafts` - Same as build but includes draft posts (equivalent to `node build.js --buildDrafts`)

## Draft Posts

Posts can be marked as drafts by adding `draft: true` to the frontmatter. Draft posts are excluded from builds by default but can be included using the `--buildDrafts` or `-D` flag. Draft posts are visually marked with a "DRAFT" badge when included in builds.

## Architecture

This is a static blog built with HTMX that generates HTML from markdown files. The core workflow:

1. **Content Creation**: Write posts as markdown files in `posts_src/`
2. **Build Process**: `build.js` converts markdown to HTML using markdown-it, wraps content in `<article>` tags, and generates full HTML pages using `index_template.html` as the base template
3. **Navigation**: Builds dynamic navigation links with HTMX attributes for SPA-like behavior
4. **Deployment**: Uses Cloudflare Pages with KV storage for visit tracking

### Key Files

- `build.js` - Main build script that processes markdown and generates HTML
- `index_template.html` - Base template with `<!-- NAV_LINKS -->` and `<!-- MAIN_CONTENT -->` placeholders
- `posts_src/*.md` - Source markdown files for blog posts (use `# Title` for the first line to set page title)
- `pages/*.md` - Source markdown files for static pages (like about)
- `posts/*.html` - Generated HTML files (auto-created, don't edit directly)
- `functions/track.js` - Cloudflare Pages function for visit tracking
- `admin.js` - Analytics worker (separate from main blog)

### HTMX Integration

Navigation uses HTMX for dynamic content loading:
- Links use `hx-get`, `hx-select="article"`, `hx-target="#content"`, and `hx-push-url="true"`
- Supports both HTMX navigation and direct URL access

### Cloudflare Pages Setup

- Uses `wrangler.toml` for configuration
- KV namespace `VISIT_LOG` for tracking (different bindings for preview/production)
- Visit tracking function at `/functions/track.js` logs requests to KV storage