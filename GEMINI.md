# 2. CURRENT PROJECT CONTEXT

## Project Hosting Context

These projects are live domains on the internet.

-   **Hosting:** The websites are hosted using a combination of **GitHub Pages** (for serving the static files) and **Cloudflare** (for DNS, caching, and other services).
-   **Domain Registrar:** The domain names were acquired from **domene.shop**.

This context is important for any operations that might affect the live sites.

## Project Structure Guidelines

To maintain project clarity and ease of navigation, the following structure guidelines should be followed.

-   **Root Folder:** This is where the core components reside. You'll find:
    -   `GEMINI.md`: Project-specific context and instructions for the AI assistant.
    -   `favicon.ico` / `favicon.png`: The site's favicon.
    -   `CNAME`: Defines the custom domain for GitHub Pages.
    -   `index.html`: The main entry point of the website. Should contain minimal inline HTML/CSS/JS.
    -   `robots.txt`: Instructions for web crawlers.
    -   `sitemap.xml`: A map of the site for search engines.
    -   `server.py`: A simple Python script to run a local HTTP server for development.
-   **`/css` Folder:** All stylesheets go here, split into modules for maintainability (e.g., `style.css`, `bmc.css`). Inline CSS in `index.html` is strictly forbidden.
-   **`/js` Folder:** All JavaScript files go here, split into modules for maintainability (e.g., `main.js`, `bmc.js`). Inline JavaScript in `index.html` is strictly forbidden.
-   **`/images` Folder:** Contains all image assets.
-   **No `/includes` Folder:** Shared HTML components should be embedded directly into `index.html` if small and static, or loaded dynamically if complex and necessary, though static embedding is preferred for simplicity where possible.

Adhering to this structure makes projects easier to navigate and maintain.