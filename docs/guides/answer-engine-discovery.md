# Answer Engine Discovery

The public site exposes a consistent, crawlable identity for Nischay Sharma across conventional search and AI-powered answer engines.

## Discovery endpoints

- `https://nischaysharma.com/robots.txt` allows public crawling while excluding admin and API routes.
- `https://nischaysharma.com/sitemap.xml` lists canonical pages, articles, and discoverable images.
- `https://nischaysharma.com/feed.xml` publishes the latest articles as RSS.
- `https://nischaysharma.com/llms.txt` provides a concise text index of the official biography, profiles, expertise, projects, and published writing. It is a supplementary discovery file and not a ranking guarantee.

## Source consistency

The homepage, About page, article pages, metadata, visible profile links, and JSON-LD reuse the same canonical person identifier: `https://nischaysharma.com/about#nischay-sharma`.

The canonical public accounts are:

- LinkedIn: `https://www.linkedin.com/in/nischaysharma-me`
- GitHub: `https://github.com/nischaysharma-me`
- Instagram: `https://www.instagram.com/nischay.me/`
- Threads: `https://www.threads.net/@nischay.me`
- YouTube: `https://www.youtube.com/@Iamnischaysharma`

Keep the public display name, portrait, biography, occupation, and website backlink consistent on these profiles. Update profile facts through the admin profile page so visible content and structured data remain aligned.

## Validation after deployment

1. Confirm all discovery endpoints return HTTP 200 without authentication.
2. Test `/about` and a published article with a structured-data validator.
3. Submit `/sitemap.xml` to Google Search Console and Bing Webmaster Tools.
4. Monitor crawl errors and AI-search referrals in analytics and webmaster dashboards.

Search and answer engines independently decide what to crawl, cite, and rank. These endpoints improve eligibility and source clarity but cannot guarantee inclusion.
