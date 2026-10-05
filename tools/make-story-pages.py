#!/usr/bin/env python3
"""
Builds the Bible Story Library: one page per story in js/adventures.js, plus
bible-stories/index.html, and refreshes sitemap.xml.

Each page has its own title, description and structured data, so Google can
show it for searches such as "Noah's Ark story for kids".

Run from the site folder after changing js/adventures.js:
    python3 tools/make-story-pages.py
"""
import html, json, re, subprocess, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://christcaremarketingsolutions.github.io/Bible-Buddies/"
OUT = ROOT / "bible-stories"
TODAY = datetime.date.today().isoformat()
OG_IMAGE = SITE + "images/og-image.jpg"

# Stories in Bible order; the Old Testament ends at Jonah.
ADV = json.loads(subprocess.check_output(
    ["node", "-e", "const fs=require('fs');eval(fs.readFileSync(process.argv[1],'utf8').replace(/^const ADVENTURES/m,'global.ADVENTURES'));process.stdout.write(JSON.stringify(ADVENTURES))",
     str(ROOT / "js/adventures.js")]))
OT_LAST = next(i for i, a in enumerate(ADV) if a["id"] == "jonah")

SLUG_OVERRIDE = {"creation": "creation-story", "resurrection": "jesus-is-alive-easter-story"}
def slug(a):
    if a["id"] in SLUG_OVERRIDE: return SLUG_OVERRIDE[a["id"]]
    s = a["title"].lower().replace("'", "").replace("’", "").replace(",", "")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

esc = lambda s: html.escape(s, quote=True)

def shorten(text, n):
    if len(text) <= n: return text
    cut = text[:n].rsplit(" ", 1)[0].rstrip(",.;:")
    return cut + "…"

# ---------- page shell: header, footer and scripts from stories.html ----------
tpl = (ROOT / "stories.html").read_text()
head_end = tpl.index("  <!-- SEO -->")
head_after = tpl[tpl.index("  <!-- /SEO -->") + len("  <!-- /SEO -->"):tpl.index("</head>")]
body_start = tpl[tpl.index("<body"):tpl.index("  <main id=\"main\">")]
body_end = tpl[tpl.index("  </main>") + len("  </main>"):tpl.index("  <script src=\"js/data.js")]
scripts = re.findall(r'  <script src="js/[^"]+"></script>\n', tpl)
version = re.search(r"js/app\.js\?v=(\w+)", tpl).group(1)

def up(fragment):
    """Point relative links one folder up (pages live in bible-stories/)."""
    return re.sub(r'((?:href|src)=")(?!https?:|//|#|mailto:|tel:|data:|javascript:)([^"]+)"', r'\1../\2"', fragment)

def head(title, desc, url, ld):
    return (f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script>document.documentElement.classList.add('js')</script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  <!-- SEO -->
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="{url}">
  <link rel="icon" href="../favicon.ico?v=4" sizes="any">
  <link rel="icon" type="image/svg+xml" href="../images/favicon.svg?v=4">
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32.png?v=4">
  <link rel="apple-touch-icon" href="../images/apple-touch-icon.png?v=4">
  <meta property="og:site_name" content="Bible Buddies">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="en_GB">
  <meta property="og:title" content="{esc(title.replace(' | Bible Buddies', ''))}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(title.replace(' | Bible Buddies', ''))}">
  <meta name="twitter:description" content="{esc(desc)}">
  <meta name="twitter:image" content="{OG_IMAGE}">
''' + "".join(f'  <script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in ld)
      + "  <!-- /SEO -->" + up(head_after) + "</head>\n")

def foot(extra_script=""):
    return up(body_end) + "".join(up(s) for s in scripts) + extra_script + \
        '  <script>document.getElementById("year").textContent = new Date().getFullYear();</script>\n</body>\n</html>\n'

PUBLISHER = {"@type": "Organization", "name": "Bible Buddies", "url": SITE}
AUDIENCE = {"@type": "PeopleAudience", "suggestedMinAge": 4, "suggestedMaxAge": 11}

# ---------- one page per story ----------
OUT.mkdir(exist_ok=True)
for old in OUT.glob("*.html"): old.unlink()
pages = []
for i, a in enumerate(ADV):
    s = slug(a); url = f"{SITE}bible-stories/{s}.html"
    title = f"{a['title']}: Bible Story for Kids ({a['ref']}) | Bible Buddies"
    desc = shorten(f"{a['title']} for kids, from {a['ref']}. " + a["story"][0], 158)
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
        {"@type": "ListItem", "position": 2, "name": "Bible Story Library", "item": SITE + "bible-stories/"},
        {"@type": "ListItem", "position": 3, "name": a["title"], "item": url}]}
    article = {"@context": "https://schema.org", "@type": "Article", "headline": f"{a['title']}: Bible Story for Kids",
        "description": desc, "url": url, "mainEntityOfPage": url, "image": OG_IMAGE, "inLanguage": "en",
        "isAccessibleForFree": True, "audience": AUDIENCE, "about": {"@type": "Thing", "name": f"{a['ref']} (The Bible)"},
        "genre": "Bible story for children", "datePublished": "2026-10-05", "dateModified": TODAY,
        "author": PUBLISHER, "publisher": PUBLISHER, "isPartOf": {"@type": "CollectionPage", "name": "Bible Story Library", "url": SITE + "bible-stories/"}}
    prev_a, next_a = ADV[i - 1] if i else None, ADV[i + 1] if i + 1 < len(ADV) else None
    choices = "".join(f'<button type="button" class="adv-choice" data-i="{k}">{esc(c)}</button>' for k, c in enumerate(a["question"]["choices"]))
    nav = '<nav class="sl-pager" aria-label="More stories">' + \
        (f'<a href="{slug(prev_a)}.html">← {esc(prev_a["title"])}</a>' if prev_a else '<span></span>') + \
        '<a href="index.html">📚 All stories</a>' + \
        (f'<a href="{slug(next_a)}.html">{esc(next_a["title"])} →</a>' if next_a else '<span></span>') + '</nav>'
    main = f'''  <main id="main">
    <section class="section sl-section"><div class="container">
      <p class="sl-crumbs"><a href="../index.html">Home</a> › <a href="index.html">Bible Story Library</a> › {esc(a["title"])}</p>
      <article class="featured adventure">
        <span class="tag">{"Old Testament" if i <= OT_LAST else "New Testament"} · Bible story</span>
        <div class="adv-emoji" aria-hidden="true">{a["emoji"]}</div>
        <h1>{esc(a["title"])}</h1>
        <p class="adv-ref">📖 {esc(a["ref"])} <button type="button" class="adv-listen" data-listen>🔊 Listen</button></p>
        <div class="adv-body">
          <div class="adv-story">
{chr(10).join(f"            <p>{esc(p)}</p>" for p in a["story"])}
          </div>
          <aside class="adv-side">
            <div class="adv-box adv-fact"><strong>💡 Did you know?</strong> {esc(a["fact"])}</div>
            <div class="adv-box adv-quiz">
              <strong>❓ Quick question</strong>
              <p>{esc(a["question"]["q"])}</p>
              <div class="adv-choices" data-choices data-answer="{a["question"]["answer"]}">{choices}</div>
              <p class="adv-result" data-result aria-live="polite"></p>
            </div>
            <div class="adv-box adv-challenge"><strong>🎯 Challenge</strong> {esc(a["challenge"])}</div>
          </aside>
        </div>
        <p class="adv-more">Want more? <a href="../games.html">🎮 Play Bible games</a> · <a href="../memory-verses.html">⭐ Memory verses</a></p>
      </article>
      {nav}
    </div></section>
  </main>'''
    script = f'''  <script>
  (function(){{
    const story = document.querySelector(".adv-story");
    document.querySelector("[data-listen]").addEventListener("click", () => speakText(document.querySelector("h1").textContent + ". " + story.textContent));
    const wrap = document.querySelector("[data-choices]"), res = document.querySelector("[data-result]"), ans = Number(wrap.dataset.answer);
    wrap.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {{
      if (Number(b.dataset.i) === ans) {{
        wrap.querySelectorAll("button").forEach(x => x.disabled = true); b.classList.add("right");
        res.textContent = "✅ Yes, that's right! Well done!";
        if (typeof bbAddStars === "function") bbAddStars(1, "story-{a["id"]}");
        if (typeof bbConfetti === "function") bbConfetti();
      }} else {{ b.classList.add("wrong"); b.disabled = true; res.textContent = "Not quite. Have another look at the story and try again!"; }}
    }}));
  }})();
  </script>
'''
    page = head(title, desc, url, [crumbs, article]) + up(body_start) + main + foot(script)
    (OUT / f"{s}.html").write_text(page)
    pages.append((s, a, i))

# ---------- library index ----------
def card(s, a):
    return (f'<a class="card sl-card" href="{s}.html"><span class="sl-emoji" aria-hidden="true">{a["emoji"]}</span>'
            f'<strong>{esc(a["title"])}</strong><small>📖 {esc(a["ref"])}</small>'
            f'<span class="sl-blurb">{esc(shorten(a["story"][0], 110))}</span></a>')
ot = "".join(card(s, a) for s, a, i in pages if i <= OT_LAST)
nt = "".join(card(s, a) for s, a, i in pages if i > OT_LAST)
idx_url = SITE + "bible-stories/"
idx_title = "Bible Story Library: 30 Free Bible Stories for Kids | Bible Buddies"
idx_desc = "Read 30 free Bible stories for kids online, from Creation and Noah's Ark to David and Goliath, Jesus' miracles and Easter. Each with a fun fact and quiz."
ld = [{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE},
        {"@type": "ListItem", "position": 2, "name": "Bible Story Library", "item": idx_url}]},
      {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Bible Story Library", "description": idx_desc, "url": idx_url,
       "inLanguage": "en", "isAccessibleForFree": True, "audience": AUDIENCE, "publisher": PUBLISHER,
       "mainEntity": {"@type": "ItemList", "numberOfItems": len(pages), "itemListElement": [
           {"@type": "ListItem", "position": n + 1, "url": f"{SITE}bible-stories/{s}.html", "name": a["title"]} for n, (s, a, i) in enumerate(pages)]}}]
main = f'''  <main id="main">
    <section class="section center" style="background:var(--grape);color:#fff">
      <div class="container">
        <div style="font-size:2.1rem" aria-hidden="true">📚</div>
        <h1 style="color:#fff">Bible Story Library</h1>
        <p style="font-size:1.15rem;max-width:48ch;margin:.4rem auto 0">{len(pages)} Bible stories for kids, retold simply from the Bible. Each one has a fun fact, a quick quiz and a challenge for today.</p>
      </div>
    </section>
    <section class="section"><div class="container">
      <div class="section-head"><h2>📜 Old Testament stories</h2></div>
      <div class="sl-grid">{ot}</div>
      <div class="section-head" style="margin-top:2.5rem"><h2>✝️ New Testament stories</h2></div>
      <div class="sl-grid">{nt}</div>
    </div></section>
  </main>'''
(OUT / "index.html").write_text(head(idx_title, idx_desc, idx_url, ld).replace('content="article"', 'content="website"') + up(body_start) + main + foot())

# ---------- sitemap ----------
main_pages = [("", "1.0"), ("stories.html", "0.9"), ("bible-stories/", "0.9"), ("games.html", "0.9"), ("meet-jesus.html", "0.8"),
              ("memory-verses.html", "0.8"), ("colouring.html", "0.7"), ("comics.html", "0.6"), ("explorer.html", "0.7"),
              ("teachers.html", "0.7"), ("about.html", "0.5"), ("contact.html", "0.5")]
urls = [(SITE + p, pr) for p, pr in main_pages] + [(f"{SITE}bible-stories/{s}.html", "0.7") for s, a, i in pages]
(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>\n" for u, pr in urls) + "</urlset>\n")
print(f"Built {len(pages)} story pages + library index; sitemap has {len(urls)} URLs (assets ?v={version})")
