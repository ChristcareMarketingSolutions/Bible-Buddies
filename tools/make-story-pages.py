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

# Other names people search for, shown on the page and used in its description.
ALSO_KNOWN = {
    "creation": "the creation story, the 7 days of creation", "noah": "Noah and the flood, the rainbow promise",
    "abraham": "Abraham and Sarah, God's covenant with Abraham", "joseph": "Joseph's coat of many colors, Joseph and his brothers",
    "baby-moses": "baby Moses in the Nile", "burning-bush": "God calls Moses", "red-sea": "the parting of the Red Sea, the Exodus",
    "jericho": "Joshua and the battle of Jericho", "ruth": "Ruth and Naomi, Ruth and Boaz", "samuel": "Samuel hears God's voice",
    "david-goliath": "David versus Goliath, the shepherd boy and the giant", "elijah": "Elijah on Mount Carmel, Elijah and the prophets of Baal",
    "esther": "Queen Esther, for such a time as this", "fiery-furnace": "Shadrach, Meshach and Abednego",
    "daniel-lions": "Daniel and the lions' den", "jonah": "Jonah and the whale", "jesus-born": "the Christmas story, the nativity story, baby Jesus",
    "wise-men": "the three wise men, the magi, the star of Bethlehem", "boy-jesus": "young Jesus in the temple",
    "fishermen": "fishers of men, the miraculous catch of fish", "water-wine": "the wedding at Cana, Jesus' first miracle",
    "calms-storm": "Jesus stills the storm", "feeds-5000": "the feeding of the 5000, loaves and fishes",
    "walks-water": "Peter walks on water", "good-samaritan": "the parable of the Good Samaritan", "lost-sheep": "the parable of the lost sheep",
    "children": "let the little children come to me", "zacchaeus": "Zacchaeus the tax collector", "bartimaeus": "Jesus heals blind Bartimaeus",
    "resurrection": "the Easter story, the empty tomb, the resurrection of Jesus",
}

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
    aka = ALSO_KNOWN.get(a["id"], "")
    desc = shorten(f"{a['title']} for kids ({aka.split(',')[0]}), from {a['ref']}. A free Bible story with a fun fact, quiz and Sunday school lesson ideas.", 158) if aka else \
        shorten(f"{a['title']} for kids, from {a['ref']}. " + a["story"][0], 158)
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
        {f'<p class="sl-aka">Also known as: {esc(aka)}</p>' if aka else ''}
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
      <section class="sl-lesson" aria-labelledby="lesson-h">
        <h2 id="lesson-h">👩‍🏫 Use this story as a Sunday school lesson</h2>
        <p>This free kids Bible lesson works for Sunday school, children's church, VBS or family devotions (about 20 minutes, ages 4 to 11).</p>
        <ol>
          <li><strong>Read the story</strong> together from {esc(a["ref"])}, or tap 🔊 Listen (5 minutes).</li>
          <li><strong>Ask the quick question</strong>: "{esc(a["question"]["q"])}" Then talk about it: what does this story teach us about God?</li>
          <li><strong>Learn a memory verse</strong> from our <a href="../memory-verses.html">daily memory verses</a>.</li>
          <li><strong>Play</strong> a <a href="../games.html">Bible game</a> or colour a <a href="../colouring.html">Bible colouring page</a>.</li>
          <li><strong>Take home the challenge</strong>: {esc(a["challenge"])}</li>
          <li><strong>Close in prayer</strong>, thanking God for what you learned.</li>
        </ol>
      </section>
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
idx_title = "Free Bible Stories for Kids: 30 Short Bible Stories to Read Online | Bible Buddies"
idx_desc = "Read 30 free, short Bible stories for kids online: Creation, Noah's Ark, David and Goliath, Jonah, Christmas, Jesus' miracles and Easter. Great for Sunday school."
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
        <p class="tag" style="display:inline-block;background:var(--sun);color:var(--ink);padding:.2rem .9rem;border-radius:999px;font-weight:800">Bible Story Library</p>
        <h1 style="color:#fff">Free Bible Stories for Kids</h1>
        <p style="font-size:1.15rem;max-width:48ch;margin:.4rem auto 0">{len(pages)} short Bible stories for children, retold simply from the Bible. Each one has a fun fact, a quick quiz, a challenge and Sunday school lesson ideas.</p>
      </div>
    </section>
    <section class="section"><div class="container">
      <div class="section-head"><h2>📜 Old Testament stories</h2></div>
      <div class="sl-grid">{ot}</div>
      <div class="section-head" style="margin-top:2.5rem"><h2>✝️ New Testament stories</h2></div>
      <div class="sl-grid">{nt}</div>
      <div class="seo-blurb">
        <h2>Short Bible stories for kids, families and Sunday school</h2>
        <p>These free Bible stories for kids are written in simple words for children aged 4 to 11, and every story gives its Bible reference so you can read it in your own Bible too. Use them as bedtime Bible stories, for family devotions, or as ready-made Sunday school lessons and children's church lessons. Each page has a "Listen" button that reads the story aloud, a quiz question, a daily challenge and a step-by-step lesson plan for teachers. Find more <a href="../games.html">free Bible games for kids</a>, <a href="../colouring.html">Bible coloring pages</a> and <a href="../teachers.html">Sunday school resources</a>.</p>
      </div>
    </div></section>
  </main>'''
(OUT / "index.html").write_text(head(idx_title, idx_desc, idx_url, ld).replace('content="article"', 'content="website"') + up(body_start) + main + foot())

# ---------- Teacher Corner: list every story as a free Sunday school lesson ----------
tp = ROOT / "teachers.html"; t = tp.read_text()
lessons = "".join(f'<li><a href="bible-stories/{s}.html">{esc(a["title"])}</a> <small>({esc(a["ref"])})</small></li>' for s, a, i in pages)
block = (f'<!-- LESSONS (built by tools/make-story-pages.py) -->\n      <ol class="lesson-list">{lessons}</ol>\n      <!-- /LESSONS -->')
t = re.sub(r"<!-- LESSONS.*?<!-- /LESSONS -->", lambda m: block, t, flags=re.S)
tp.write_text(t)

# ---------- sitemap ----------
main_pages = [("", "1.0"), ("stories.html", "0.9"), ("bible-stories/", "0.9"), ("games.html", "0.9"), ("meet-jesus.html", "0.8"),
              ("memory-verses.html", "0.8"), ("colouring.html", "0.7"), ("comics.html", "0.6"), ("explorer.html", "0.7"),
              ("teachers.html", "0.7"), ("about.html", "0.5"), ("contact.html", "0.5")]
urls = [(SITE + p, pr) for p, pr in main_pages] + [(f"{SITE}bible-stories/{s}.html", "0.7") for s, a, i in pages]
(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>\n" for u, pr in urls) + "</urlset>\n")
print(f"Built {len(pages)} story pages + library index; sitemap has {len(urls)} URLs (assets ?v={version})")
