// build.js
import fs from "fs";
import path from "path";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: true });
const inputDir = "posts_src";
const outputDir = "dist";
const templatePath = "index_template.html";
const indexOut = "index.html";

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
    const mdContent = fs.readFileSync(path.join(inputDir, file), "utf8");
    const { frontmatter, content } = parseFrontmatter(mdContent);
    
    // Use frontmatter data or fallbacks
    const slug = frontmatter.slug || path.basename(file, ".md");
    const title = frontmatter.title || slug;
    const date = frontmatter.date || "2025-01-01";
    
    // Parse date to create directory structure
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    
    // Create the URL path and file path
    const urlPath = `/${year}/${month}/${slug}/`;
    const dirPath = path.join(outputDir, String(year), month, slug);
    const filePath = path.join(dirPath, 'index.html');
    
    return { 
      slug, 
      title, 
      date, 
      mdContent: content, 
      urlPath,
      dirPath,
      filePath,
      dateObj
    };
  })
  .sort((a, b) => b.dateObj - a.dateObj); // Sort by date, newest first

// 2. Build the nav HTML from the postDataList (now empty since we show snippets on index)
const navLinks = "";

// 3. Generate individual full HTML pages for each post
const baseTemplateContent = fs.readFileSync(templatePath, "utf8");

postDataList.forEach((post) => {
  // Add date after first header
  let contentWithDate = post.mdContent;
  const firstHeaderMatch = contentWithDate.match(/^(# .+)$/m);
  if (firstHeaderMatch) {
    const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    contentWithDate = contentWithDate.replace(
      firstHeaderMatch[0],
      `${firstHeaderMatch[0]}\n*${dateFormatted}*`
    );
  }
  
  const htmlBody = md.render(contentWithDate);
  const articleContent = `<article>\n${htmlBody}\n<div class="back-link"><a href="/">← Back to Home</a></div>\n</article>`;

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

// 4. Copy static assets to dist
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

// 5. Generate index page with post snippets
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
  
  return `
    <article class="post-snippet">
      <h2><a href="${post.urlPath}">${post.title}</a></h2>
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
