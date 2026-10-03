# ✝️ Bible Buddies

*Learn • Play • Discover Jesus* — a free, kid-friendly Bible website.
Static HTML/CSS/JavaScript. No backend, no logins, no data collection from children.
Runs by double-clicking `index.html`, and deploys to GitHub Pages.

---

## Folder structure

```
bible-buddies/
├── index.html            Home
├── stories.html          Bible stories (data-driven)
├── comics.html           Jesus comics (your PDFs)
├── games.html            Memory Match, Who Am I, Word Scramble, Quiz
├── colouring.html        Colouring pages + drawing board
├── explorer.html         Characters, places, timeline
├── memory-verses.html    Verses + practice
├── meet-jesus.html       Jesus journey + teachings
├── teachers.html         Teacher Corner
├── about.html / contact.html
├── 404.html              Friendly "page not found"
├── manifest.json         Installable-app settings
├── service-worker.js     Offline support
├── css/style.css         ALL styling + colours (top of file = tokens)
├── js/
│   ├── data.js           ← ALL your content lives here
│   ├── app.js            Nav, search, daily content, verse tools
│   ├── progress.js       Stars & badges (localStorage)
│   ├── games.js          Games
│   └── quiz.js           Quiz
├── google-apps-script/   Optional: send contact emails from your own Gmail
├── images/  comics/  colouring/  stories/  resources/   ← drop your files here
```

**Change site colours:** open `css/style.css`, edit the `:root` block at the top. One change updates every page.

---

## 1. Add a new Bible story
Open `js/data.js`, find `STORIES`, copy one block, edit it:
```js
{
  id: "prodigal-son",
  title: "The Prodigal Son",
  category: "Parables",          // must match a name in STORY_CATEGORIES
  emoji: "🏃",
  description: "A father welcomes his son home with open arms.",
  readMins: 4, age: "6–11",
  comic: "",                      // e.g. "comics/prodigal-son.pdf"
  pdf: "stories/prodigal-son.pdf" // optional printable story
}
```
Save. The story, its filter, and the search all update automatically.

## 2. Add a new comic PDF
1. Put the PDF in the `comics/` folder, e.g. `comics/lost-sheep.pdf`.
2. In `js/data.js`, set that story's `comic` field: `comic: "comics/lost-sheep.pdf"`.
The comics page shows **Read online** and **Download PDF** buttons automatically.

## 3. Add a colouring image
1. Put the image (PNG/JPG/WebP or PDF) in the `colouring/` folder.
2. On `colouring.html`, copy one of the `.card` blocks and point its Download
   button at your file, e.g. `<a class="btn btn-coral" href="colouring/noah.png" download>Download</a>`.

## 4. Add a new game
- Small data games (new Who-Am-I clues, scramble words, quiz questions):
  just add entries to `WHO_AM_I`, `SCRAMBLE_WORDS` or `QUIZ` in `js/data.js`.
- A brand-new game: add a `<div class="game-stage" data-mygame>…</div>` on
  `games.html`, then write an `initMyGame()` function in `js/games.js` that
  boots only if that element exists (copy the pattern of the existing games).

## 5. Add a memory verse
Open `js/data.js`, add to `VERSES`:
```js
{ text: "Your verse text here.", ref: "Book 1:1", explain: "Simple explanation for kids." }
```
The daily verse, the verses page and search all pick it up. More verses =
longer before the daily verse repeats.

---

## 6. Deploy to GitHub Pages
1. Create a free GitHub account and a new repository, e.g. `bible-buddies`.
2. Upload all these files (drag-and-drop on github.com, or `git push`).
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** →
   Branch: `main`, Folder: `/ (root)` → **Save**.
4. Wait ~1 minute. Your site is live at
   `https://YOUR-USERNAME.github.io/bible-buddies/`.

*Tip:* visitors get page, CSS and JS updates automatically. When you change
`css/style.css` or a file in `js/`, also change the `?v=…` number after it in
the HTML pages (e.g. `?v=20261002` → `?v=20261015`) so browsers don't reuse an
old saved copy. Only edit
`CACHE_VERSION` in `service-worker.js` (e.g. `v4` → `v5`) if you rename or
remove files listed in it.

## 7. Connect a custom `.com` domain later
1. Buy a domain (GoDaddy, Namecheap, Google Domains, etc.).
2. In the repo, create a file named **`CNAME`** (no extension) containing just
   your domain, e.g. `biblebuddies.com`.
3. At your domain registrar, add DNS records pointing to GitHub Pages:
   - Four `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - One `CNAME` record for `www` → `YOUR-USERNAME.github.io`
4. Repo → **Settings → Pages** → enter your domain → **Save**, and tick
   **Enforce HTTPS** once it's available.

---

## Child safety & copyright
- No accounts, chat, comments, public profiles or leaderboards.
- Progress is stored only in the child's browser (`localStorage`).
- The contact form is for adults. It sends messages to your inbox through the
  free FormSubmit.co service (change the address in the `TO` line of
  `contact.html`). The very first message triggers an "Activate form" email
  from FormSubmit; click its link once and every later message arrives.
  Each sender also gets an automatic welcome email; edit its wording in
  `WELCOME_MESSAGE` near the top of the script in `contact.html`.
- To send these emails from your own Gmail instead (free), follow
  `google-apps-script/SETUP.md` and paste the web app address into
  `APPS_SCRIPT_URL` in `contact.html`.
- **Only add artwork, comics, stories and Bible text you have the right to use.**
  Placeholders here are original/simple so you can replace them freely.

---

## 8. Search engines (SEO) and sharing
- Every page has its own title, description, share picture (`images/og-image.jpg`,
  `images/og-journey.jpg`) and structured data in the `<!-- SEO -->` block in its `<head>`.
- `sitemap.xml` lists every page. If you add a page, add it there too.
- The site address used for sharing is `SITE_URL` near the top of the sharing code in
  `js/app.js`. If you move to your own domain, change it there, in `sitemap.xml`,
  `robots.txt` and the `<!-- SEO -->` blocks.
- **Google Search Console** (free): go to <https://search.google.com/search-console>,
  add the site address as a "URL prefix" property, verify it (choose "HTML tag" and send
  the tag to your developer), then submit `sitemap.xml` under **Sitemaps**.
- Sharing: every page has a "Share Bible Buddies" button in the footer, the daily verse
  has "Share verse" (makes a picture card), and each Journey stop has a link of its own,
  e.g. `journey.html#stop-12`.
