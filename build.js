// build.js
import fs from "fs";
import path from "path";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: true });
const inputDir = "posts_src";
const pagesDir = "pages";
const outputDir = "dist";
const templatePath = "index_template.html";
const indexOut = "index.html";

// Check for build drafts flag
const buildDrafts = process.argv.includes('--buildDrafts') || process.argv.includes('-D');

console.log(`Building blog${buildDrafts ? ' (including drafts)' : ''}...`);

// Function to parse frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content };
  }
  
  const frontmatterText = match[1];
  const markdownContent = match[2];
  
  // Simple YAML parser for our needs
  const frontmatter = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  });
  
  return { frontmatter, content: markdownContent };
}

// Ensure output folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Read all markdown files and collect initial post data
const postDataList = fs
  .readdirSync(inputDir)
  .filter((f) => path.extname(f) === ".md")
  .map((file) => {
    const filePath = path.join(inputDir, file);
    const mdContent = fs.readFileSync(filePath, "utf8");
    const { frontmatter, content } = parseFrontmatter(mdContent);
    
    // Get file creation time for secondary sorting
    const fileStats = fs.statSync(filePath);
    const fileCreationTime = fileStats.birthtime;
    
    // Use frontmatter data or fallbacks
    const slug = frontmatter.slug || path.basename(file, ".md");
    const title = frontmatter.title || slug;
    const date = frontmatter.date || "2025-01-01";
    const draft = frontmatter.draft === 'true' || frontmatter.draft === true;
    
    // Parse date to create directory structure
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    
    // Create the URL path and file path
    const urlPath = `/${year}/${month}/${slug}/`;
    const dirPath = path.join(outputDir, String(year), month, slug);
    const outputFilePath = path.join(dirPath, 'index.html');
    
    return { 
      slug, 
      title, 
      date, 
      draft,
      mdContent: content, 
      urlPath,
      dirPath,
      filePath: outputFilePath,
      dateObj,
      fileCreationTime
    };
  })
  .filter(post => {
    // Filter out drafts unless buildDrafts flag is set
    if (post.draft && !buildDrafts) {
      console.log(`Skipping draft: ${post.title}`);
      return false;
    }
    return true;
  })
  .sort((a, b) => {
    // Primary sort: by frontmatter date (newest first)
    const dateDiff = b.dateObj - a.dateObj;
    if (dateDiff !== 0) {
      return dateDiff;
    }
    // Secondary sort: by file creation time for same dates (newer files first)
    return b.fileCreationTime - a.fileCreationTime;
  });

// 2. Build the nav HTML from the postDataList (now empty since we show snippets on index)
const navLinks = "";

// 3. Generate individual full HTML pages for each post
const baseTemplateContent = fs.readFileSync(templatePath, "utf8");

postDataList.forEach((post) => {
  // Add date and visit counter after first header
  let contentWithDate = post.mdContent;
  const firstHeaderMatch = contentWithDate.match(/^(# .+)$/m);
  if (firstHeaderMatch) {
    const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const encodedPath = encodeURIComponent(post.urlPath);
    const visitCounter = `<span class="visit-counter" hx-get="/visits?path=${encodedPath}" hx-trigger="load" hx-swap="innerHTML">
      <span class="visit-count">👁️ Loading...</span>
    </span>`;
    const draftIndicator = post.draft ? ' • <span class="draft-badge">DRAFT</span>' : '';
    contentWithDate = contentWithDate.replace(
      firstHeaderMatch[0],
      `${firstHeaderMatch[0]}\n*${dateFormatted} • ${visitCounter}${draftIndicator}*`
    );
  }
  
  const htmlBody = md.render(contentWithDate);
  
  // Create tone transformation buttons
  const toneButtons = `
    <div class="tone-controls">
      <h3>🎭 Transform This Post</h3>
      <div class="tone-buttons">
        <button onclick="transformPost('sarcastic')" class="tone-btn">
          😏 Sarcastic
        </button>
        <button onclick="transformPost('techbro')" class="tone-btn">
          🚀 Tech Bro
        </button>
        <button onclick="transformPost('ubersnarky')" class="tone-btn">
          😤 Uber Snarky
        </button>
        <button onclick="restoreOriginal()" class="tone-btn restore-btn">
          🔄 Original
        </button>
      </div>
      <div id="loading-indicator" class="loading-indicator" style="display: none;">
        <span class="loading-text">🤖 AI is thinking... probably judging your writing style...</span>
      </div>
    </div>
    
    <script>
      // Store original content and markdown
      window.originalContent = ${JSON.stringify(htmlBody)};
      window.originalMarkdown = ${JSON.stringify(post.mdContent)};
      
      function restoreOriginal() {
        document.getElementById('post-content').innerHTML = window.originalContent;
        document.getElementById('loading-indicator').style.display = 'none';
      }
      
      async function transformPost(tone) {
        console.log('transformPost called with tone:', tone);
        
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        console.log('Loading indicator element:', loadingIndicator);
        if (loadingIndicator) {
          loadingIndicator.style.display = 'block';
        }
        
        try {
          const response = await fetch('/transform', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              tone: tone,
              content: window.originalMarkdown
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.transformedContent) {
              // Convert markdown to HTML for transformed content
              let transformedHtml = data.transformedContent;
              
              // Convert headers (order matters - do h3 first)
              transformedHtml = transformedHtml.replace(/^### (.+)$/gm, '<h3>$1</h3>');
              transformedHtml = transformedHtml.replace(/^## (.+)$/gm, '<h2>$1</h2>');
              transformedHtml = transformedHtml.replace(/^# (.+)$/gm, '<h1>$1</h1>');
              
              // Convert bold and italic
              transformedHtml = transformedHtml.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
              transformedHtml = transformedHtml.replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
              
              // Convert links
              transformedHtml = transformedHtml.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>');
              
              // Convert simple line breaks and paragraphs
              transformedHtml = transformedHtml.replace(/\\n\\n/g, '</p><p>');
              transformedHtml = transformedHtml.replace(/\\n/g, '<br>');
              transformedHtml = '<p>' + transformedHtml + '</p>';
              
              // Clean up empty paragraphs
              transformedHtml = transformedHtml.replace(/<p><\\/p>/g, '');
              transformedHtml = transformedHtml.replace(/<p>(<h[1-6]>)/g, '$1');
              transformedHtml = transformedHtml.replace(/(<\\/h[1-6]>)<\\/p>/g, '$1');
              
              document.getElementById('post-content').innerHTML = 
                '<div class="transformed-content"><em>🎭 ' + tone.charAt(0).toUpperCase() + tone.slice(1) + ' version:</em><br><br>' + 
                transformedHtml + '</div>';
            }
          } else {
            document.getElementById('post-content').innerHTML = 
              '<div class="transformed-content"><em>❌ Failed to transform content. Try again!</em></div>';
          }
        } catch (error) {
          console.error('Transformation error:', error);
          const postContent = document.getElementById('post-content');
          if (postContent) {
            postContent.innerHTML = 
              '<div class="transformed-content"><em>❌ Network error: ' + error.message + '</em></div>';
          }
        }
        
        // Hide loading indicator
        document.getElementById('loading-indicator').style.display = 'none';
      }
    </script>
  `;

  const articleContent = `<article>
    <div id="post-content">${htmlBody}</div>
    ${toneButtons}
    <div class="back-link"><a href="/">← Back to Home</a></div>
  </article>`;

  let postPageHtml = baseTemplateContent;
  postPageHtml = postPageHtml.replace("<!-- NAV_LINKS -->", navLinks);
  // Replace the title in the template with the post's specific title
  postPageHtml = postPageHtml.replace(
    "<title>My HTMX Blog</title>",
    `<title>${post.title} - Adam's Blog</title>`
  );
  postPageHtml = postPageHtml.replace("<!-- MAIN_CONTENT -->", articleContent);

  // Ensure the directory exists
  fs.mkdirSync(post.dirPath, { recursive: true });
  
  // Write the file
  fs.writeFileSync(post.filePath, postPageHtml);
  console.log(`Built ${post.urlPath}index.html`);
});

console.log(`Built ${postDataList.length} post page(s).`);

// 4. Generate static pages (like about)
if (fs.existsSync(pagesDir)) {
  const pageFiles = fs.readdirSync(pagesDir)
    .filter(f => path.extname(f) === ".md");
  
  pageFiles.forEach(file => {
    const pagePath = path.join(pagesDir, file);
    const mdContent = fs.readFileSync(pagePath, "utf8");
    const { frontmatter, content } = parseFrontmatter(mdContent);
    
    const slug = frontmatter.slug || path.basename(file, ".md");
    const title = frontmatter.title || slug;
    
    const htmlBody = md.render(content);
    
    const articleContent = `<article>
      <div id="post-content">${htmlBody}</div>
      <div class="back-link"><a href="/">← Back to Home</a></div>
    </article>`;

    let pageHtml = baseTemplateContent;
    pageHtml = pageHtml.replace("<!-- NAV_LINKS -->", "");
    pageHtml = pageHtml.replace(
      "<title>My HTMX Blog</title>",
      `<title>${title} - Adam's Blog</title>`
    );
    pageHtml = pageHtml.replace("<!-- MAIN_CONTENT -->", articleContent);

    const pageOutputPath = path.join(outputDir, `${slug}.html`);
    fs.writeFileSync(pageOutputPath, pageHtml);
    console.log(`Built page: /${slug}.html`);
  });
}

// 5. Copy static assets to dist
const assetsDir = path.join(outputDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Copy assets
const sourceAssetsDir = 'assets';
if (fs.existsSync(sourceAssetsDir)) {
  const assetFiles = fs.readdirSync(sourceAssetsDir)
    .filter(file => !file.startsWith('.')) // Skip hidden files/directories
    .filter(file => {
      const stat = fs.statSync(path.join(sourceAssetsDir, file));
      return stat.isFile(); // Only copy regular files
    });
  
  assetFiles.forEach(file => {
    fs.copyFileSync(
      path.join(sourceAssetsDir, file),
      path.join(assetsDir, file)
    );
  });
  console.log(`Copied ${assetFiles.length} asset files to dist/assets/`);
}

// 6. Generate index page with post snippets
function generateSnippet(content, maxLength = 300) {
  // Remove markdown formatting for snippet
  let snippet = content
    .replace(/^#.*$/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/\n\s*\n/g, '\n') // Remove extra newlines
    .trim();
  
  // Get first paragraph or truncate
  const firstParagraph = snippet.split('\n')[0];
  if (firstParagraph.length > maxLength) {
    return firstParagraph.substring(0, maxLength).trim() + '...';
  }
  return firstParagraph;
}

const postSnippets = postDataList.map(post => {
  const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  const snippet = generateSnippet(post.mdContent);
  const draftIndicator = post.draft ? ' <span class="draft-badge">DRAFT</span>' : '';
  
  return `
    <article class="post-snippet${post.draft ? ' draft-post' : ''}">
      <h2><a href="${post.urlPath}">${post.title}${draftIndicator}</a></h2>
      <div class="post-date">${dateFormatted}</div>
      <div class="post-excerpt">${snippet}</div>
      <div class="read-more">
        <a href="${post.urlPath}" hx-get="${post.urlPath}" hx-select="article" hx-target="#content" hx-push-url="true">Read more →</a>
      </div>
    </article>
  `;
}).join('\n');

let indexHtml = baseTemplateContent; // Use the already read base template
indexHtml = indexHtml.replace("<!-- NAV_LINKS -->", navLinks);
indexHtml = indexHtml.replace("<!-- MAIN_CONTENT -->", `<div id="post-list">${postSnippets}</div>`);
fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);

console.log("Rebuilt index.html with updated nav and default content.");
