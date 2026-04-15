---
description: Regenerate studio CMS (articles + case studies + manifest)
---

Run the studio CMS generator to rebuild all L2 pages and the manifest.

```bash
cd studio/cms/generator && npm run gen
```

After it completes, report:
- Number of articles + case studies written
- Any validation warnings or errors
- Remind the user to commit the generated HTML files (`studio/articles/*.html`, `studio/work/*.html`) and the manifest (`studio/assets/data/studio-content.json`).
