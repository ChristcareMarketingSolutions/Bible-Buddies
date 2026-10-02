/* =====================================================================
   BIBLE BUDDIES — contact form mailer (Google Apps Script)

   Runs inside YOUR Google account and sends email from YOUR Gmail:
     1. a notification to you with the visitor's message (Reply goes to them)
     2. a welcome email to the visitor

   This file is NOT used by the website directly. Copy it into a Google
   Apps Script project and deploy it as a Web app — see
   google-apps-script/SETUP.md for the step-by-step guide.
   ===================================================================== */

/* ---------- SETTINGS (edit these) ---------- */
const OWNER_EMAIL = "biblebuddiesworld@gmail.com";   // where messages are sent
const SENDER_NAME = "Bible Buddies";                    // name shown as the sender
const SITE_URL    = "https://christcaremarketingsolutions.github.io/Bible-Buddies/"; // your live site, ending in /
const MAX_SUBMISSIONS_PER_DAY = 40;   // each one sends 2 emails; free Gmail allows ~100 emails/day

/* Welcome email sent to the visitor. {name} becomes their name, {site} the site address. */
const WELCOME_SUBJECT = "Thank you for contacting Bible Buddies!";
const WELCOME_TEXT =
`Hi {name},

Thank you for contacting Bible Buddies! We have received your message and will get back to you as soon as we can.

Bible Buddies is a free website that helps children discover the Bible and learn more about Jesus through stories, games, colouring pages and memory verses. While you wait, why not explore with the children in your life:

  Bible Stories:  {site}stories.html
  Bible Games:    {site}games.html
  Teacher Corner: {site}teachers.html

"Let the little children come to me." (Matthew 19:14)

God bless,
The Bible Buddies Team`;

/* ---------- web app entry points ---------- */
function doGet() {
  return ContentService.createTextOutput("Bible Buddies contact form is running.");
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // spam trap: real people never fill this hidden field — pretend success
    if (data._honey) return reply_(true);

    const name    = cleanName_(data.name);
    const email   = String(data.email || "").trim().slice(0, 200);
    const message = String(data.message || "").trim().slice(0, 5000);
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply_(false, "Please fill in your name, a valid email and a message.");
    }

    // limits: one message per email address per minute, and a daily cap
    const cache = CacheService.getScriptCache();
    const key = "sent:" + email.toLowerCase();
    if (cache.get(key)) return reply_(false, "Please wait a minute before sending another message.");
    if (!countToday_()) return reply_(false, "We've had lots of messages today. Please try again tomorrow.");
    cache.put(key, "1", 60);

    // 1. notification to you
    GmailApp.sendEmail(OWNER_EMAIL, "Bible Buddies message from " + name,
      "Name: " + name + "\nEmail: " + email + "\n\n" + message, {
        name: SENDER_NAME + " Website",
        replyTo: email,
        htmlBody:
          "<p><b>Name:</b> " + esc_(name) + "<br><b>Email:</b> " + esc_(email) + "</p>" +
          "<p style='white-space:pre-wrap'>" + esc_(message) + "</p>" +
          "<p style='color:#777;font-size:12px'>Sent from the Bible Buddies contact form. Press Reply to answer " + esc_(name) + ".</p>"
      });

    // 2. welcome email to the visitor
    const text = fill_(WELCOME_TEXT, name);
    GmailApp.sendEmail(email, WELCOME_SUBJECT,
      text + "\n\n(This is an automatic reply. Your message has reached us, so there is no need to send it again.)", {
        name: SENDER_NAME,
        replyTo: OWNER_EMAIL,
        htmlBody: welcomeHtml_(name)
      });

    return reply_(true);
  } catch (err) {
    console.error(err);
    return reply_(false, "Sorry, something went wrong. Please try again later.");
  }
}

/* ---------- helpers ---------- */
function reply_(success, message) {
  return ContentService.createTextOutput(JSON.stringify({ success: success, message: message || "" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Names go into emails sent from your Gmail, so keep them short and plain:
   no links or web addresses (stops spammers using the form to send links). */
function cleanName_(raw) {
  let n = String(raw || "").replace(/[\r\n\t<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  if (/https?:|www\.|\.[a-z]{2,}\//i.test(n)) n = "friend";
  return n;
}

function fill_(template, name) {
  return template.split("{name}").join(name).split("{site}").join(SITE_URL);
}

function esc_(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* Counts today's submissions; returns false once the daily cap is reached. */
function countToday_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const props = PropertiesService.getScriptProperties();
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const n = props.getProperty("day") === today ? Number(props.getProperty("count") || 0) : 0;
    if (n >= MAX_SUBMISSIONS_PER_DAY) return false;
    props.setProperties({ day: today, count: String(n + 1) });
    return true;
  } finally {
    lock.releaseLock();
  }
}

function welcomeHtml_(name) {
  const link = (path, label) =>
    "<a href='" + SITE_URL + path + "' style='display:inline-block;margin:4px 6px 4px 0;padding:10px 16px;" +
    "background:#4CB4E7;color:#fff;border-radius:999px;text-decoration:none;font-weight:bold'>" + label + "</a>";
  return "" +
    "<div style='font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#41383B;line-height:1.6'>" +
      "<div style='background:#4CB4E7;color:#fff;padding:20px;border-radius:16px 16px 0 0;text-align:center'>" +
        "<div style='font-size:28px;font-weight:bold'>&#10013;&#65039; Bible Buddies</div>" +
        "<div>Learn &bull; Play &bull; Discover Jesus</div>" +
      "</div>" +
      "<div style='background:#FFFDF7;padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 16px 16px'>" +
        "<p>Hi " + esc_(name) + ",</p>" +
        "<p>Thank you for contacting <b>Bible Buddies</b>! We have received your message and will get back to you as soon as we can.</p>" +
        "<p>Bible Buddies is a free website that helps children discover the Bible and learn more about Jesus through stories, games, colouring pages and memory verses. While you wait, why not explore with the children in your life:</p>" +
        "<p>" + link("stories.html", "&#128214; Bible Stories") + link("games.html", "&#127918; Bible Games") + link("teachers.html", "&#128105;&#8205;&#127979; Teacher Corner") + "</p>" +
        "<p style='background:#FFF3CC;padding:12px 16px;border-radius:12px;font-style:italic'>&ldquo;Let the little children come to me.&rdquo; (Matthew 19:14)</p>" +
        "<p>God bless,<br>The Bible Buddies Team</p>" +
        "<p style='color:#888;font-size:12px'>This is an automatic reply. Your message has reached us, so there is no need to send it again.</p>" +
      "</div>" +
    "</div>";
}
