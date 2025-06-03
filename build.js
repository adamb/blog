// build.js
import fs from "fs";
import path from "path";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();
const inputDir = "posts_src";
const outputDir = "posts";
const templatePath = "index_template.html";
const indexOut = "index.html";

// Ensure output folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 1. Read all markdown files and collect initial post data
const postDataList = fs
  .readdirSync(inputDir)
  .filter((f) => path.extname(f) === ".md")
  .map((file) => {
    const slug = path.basename(file, ".md");
    const mdContent = fs.readFileSync(path.join(inputDir, file), "utf8");
    // Grab first Markdown heading for link text
    const firstLine = mdContent.split("\n").find((l) => l.startsWith("# "));
    const title = firstLine ? firstLine.replace(/^#\s*/, "") : slug;
    const filename = `${slug}.html`;
    return { slug, title, mdContent, filename };
  });

// 2. Build the nav HTML from the postDataList
// Updated to include hx-select and ensure href is correct for direct navigation
const navLinks = postDataList
  .map(
    ({ title, filename }) =>
      `<a href="/posts/${filename}" hx-get="/posts/${filename}" hx-select="article" hx-target="#content" hx-push-url="true">${title}</a>`
  )
  .join("\n    ");

// 3. Generate individual full HTML pages for each post
const baseTemplateContent = fs.readFileSync(templatePath, "utf8");

postDataList.forEach((post) => {
  const htmlBody = md.render(post.mdContent);
  const articleContent = `<article>\n${htmlBody}</article>`;

  let postPageHtml = baseTemplateContent;
  postPageHtml = postPageHtml.replace("<!-- NAV_LINKS -->", navLinks);
  // Replace the title in the template with the post's specific title
  postPageHtml = postPageHtml.replace(
    "<title>My HTMX Blog</title>",
    `<title>${post.title} - Adam's Blog</title>`
  );
  postPageHtml = postPageHtml.replace("<!-- MAIN_CONTENT -->", articleContent);

  fs.writeFileSync(path.join(outputDir, post.filename), postPageHtml);
  console.log(`Built full page posts/${post.filename}`);
});

console.log(`Built ${postDataList.length} post page(s).`);

// 4. Rebuild index.html with updated nav and default content
let indexHtml = baseTemplateContent; // Use the already read base template
indexHtml = indexHtml.replace("<!-- NAV_LINKS -->", navLinks);
indexHtml = indexHtml.replace(
  "<!-- MAIN_CONTENT -->",
  '<p>Welcome to my blog! Click on a post above to read it.</p>'
);
fs.writeFileSync(indexOut, indexHtml);

console.log("Rebuilt index.html with updated nav and default content.");
