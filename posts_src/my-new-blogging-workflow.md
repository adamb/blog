---
title: "My New Blogging Workflow: From Idea to AI-Enhanced Post"
date: "2025-06-18"
slug: "my-new-blogging-workflow"
draft: true
---

# My New Blogging Workflow: From Idea to AI-Enhanced Post

After building this HTMX blog platform and integrating AI transformations, I've settled into a writing workflow that feels pretty efficient. Here's how I go from random idea to published post.

## The Stack

- **Writing**: Markdown files in `posts_src/`
- **Build**: Node.js script that converts to HTML
- **AI Enhancement**: Cloudflare Workers AI for tone transformations
- **Deployment**: Cloudflare Pages with automatic builds
- **Editing**: Claude Code for most file operations

## Step 1: Capture Ideas

I keep a running list of post ideas in Apple Notes, but honestly, most posts start as:
- Random conversations that spark something
- Technical problems I solve
- "I should write this down" moments while traveling

## Step 2: Draft Creation

When I'm ready to write, I create a new markdown file in `posts_src/`. The frontmatter is simple:

```markdown
---
title: "Post Title"
date: "2025-06-18"
slug: "url-friendly-slug"
draft: true
---
```

I always start with `draft: true` so I can iterate without publishing accidentally.

## Step 3: The Writing Process

I write in markdown because:
- It's portable and future-proof
- GitHub renders it nicely for previews
- The build system handles all the HTML conversion
- I can focus on content, not formatting

My typical post structure:
1. **Hook**: Start with something concrete or relatable
2. **Context**: Why does this matter?
3. **Details**: The technical or practical meat
4. **Reflection**: What did I learn? What's next?

## Step 4: Claude Code Integration

This is where the workflow gets interesting. I've been using [Claude Code](https://claude.ai/code) for most blog operations:

- **File creation**: "Create a draft post about X"
- **Content migration**: "Add this post from my old blog"
- **Technical edits**: "Fix the image sizing CSS"
- **Feature additions**: "Add draft support like Hugo"

Claude Code understands the codebase structure and can make systematic changes across multiple files. It's like having a very patient coding partner.

## Step 5: AI Tone Transformations

Once a post is live, readers can transform it into different voices:
- **Sarcastic**: For when the original is too earnest
- **Tech Bro**: Silicon Valley buzzword edition
- **Uber Snarky**: Maximum attitude version

The transformations are cached for a week, so repeated requests are instant. It's fun to see the same content through different lenses.

## Step 6: Build and Deploy

```bash
npm run build        # Standard build (excludes drafts)
npm run build:drafts # Include drafts for preview
```

Cloudflare Pages automatically deploys on git push. The entire process from writing to live site is under a minute.

## What's Working Well

**Speed**: From idea to published post is usually under an hour for technical content.

**Flexibility**: Markdown + git means I can write anywhere, edit on any device, and version control everything.

**Enhancement**: The AI transformations add value without me doing extra work.

**Maintenance**: Static site + Cloudflare means basically zero operational overhead.

## Current Friction Points

**Image handling**: Still manual. I have to download, resize, and reference images manually.

**SEO metadata**: Not thinking about this much, but probably should be.

**Analytics**: I have visit tracking but could use better insights into what resonates.

**Cross-posting**: Would be nice to automatically syndicate to other platforms.

## The Meta Layer

Writing about my writing workflow feels very meta, but I think these kinds of "how the sausage is made" posts are valuable. They help other people build their own systems and remind me to be intentional about my tools.

The best workflow is the one you actually use. This setup removes enough friction that I write more, while adding enough structure that the output looks professional.

## What's Next

I'm considering:
- **Automated image optimization** during the build process
- **Integration with Apple Notes** for smoother idea capture
- **RSS feed generation** for people who want updates
- **Comment system** using something lightweight

But honestly, the current system works well enough that I'm not in a hurry to complicate it.

*How do you handle your writing workflow? Any tools or processes that have been game-changers?*