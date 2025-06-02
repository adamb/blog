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

// 1) Generate individual post HTML fragments
const posts = fs
  .readdirSync(inputDir)
  .filter((f) => path.extname(f) === ".md")
  .map((file) => {
    const slug = path.basename(file, ".md");
    const mdContent = fs.readFileSync(path.join(inputDir, file), "utf8");
    const htmlBody = md.render(mdContent);

    // Grab first Markdown heading for link text
    const firstLine = mdContent.split("\n").find((l) => l.startsWith("# "));
    const title = firstLine ? firstLine.replace(/^#\s*/, "") : slug;

    const outName = `${slug}.html`;
    const wrapped = `<article>\n${htmlBody}</article>`;

    fs.writeFileSync(path.join(outputDir, outName), wrapped);
    console.log(`Built posts/${outName}`);

    return { slug, title, filename: outName };
  });

console.log(`Built ${posts.length} post(s).`);

// 2) Build the nav HTML from the posts array
const navLinks = posts
  .map(
    ({ title, filename }) =>
      `<a href="#" hx-get="/posts/${filename}" hx-target="#content" hx-push-url="true">${title}</a>`
  )
  .join("\n    ");

// 3) Read template, replace <!-- NAV_LINKS -->, write index.html
let template = fs.readFileSync(templatePath, "utf8");
template = template.replace("<!-- NAV_LINKS -->", navLinks);
fs.writeFileSync(indexOut, template);

console.log("Rebuilt index.html with updated nav.");
