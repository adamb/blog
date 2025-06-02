# blog

Going to make a simple blog using htmx.  


```blog/
├── index_template.html  ← your shell with a <!-- NAV_LINKS --> placeholder
├── build.js             ← Node script that:  
│     • reads all posts_src/*.md  
│     • spits out posts/*.html wrapped in <article>  
│     • regenerates index.html by filling in nav links  
├── package.json         ← lists “markdown-it” + a “build” script  
├── posts_src/           ← where you write post1.md, post2.md, etc.  
├── posts/               ← auto‐generated post1.html, post2.html, …  
├── assets/  
│    └── style.css       ← your CSS
```
