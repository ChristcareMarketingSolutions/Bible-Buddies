# Send contact-form emails from your own Gmail

The file `Code.gs` in this folder is a small Google Apps Script. It runs inside
your Google account and, for every contact-form message, sends from **your
Gmail**:

1. a notification to you with the visitor's message (press **Reply** to answer them), and
2. a welcome email to the visitor.

It is free. A normal Gmail account can send about 100 emails a day, and each
message uses 2, so the script stops at 40 messages a day to stay safely under
that limit.

Until you finish these steps, the website keeps using FormSubmit.co, so the
form never stops working.

## Step 1: Create the script (about 5 minutes)

1. Sign in to Google as **biblebuddiesworld@gmail.com** and open
   <https://script.google.com>.
2. Click **New project**, then click "Untitled project" at the top and rename it
   to **Bible Buddies Contact Form**.
3. Delete everything in the editor, then paste in the whole of `Code.gs`
   (from this folder).
4. Check the settings at the top. `SITE_URL` must be your live site address,
   ending in `/`. Change it if your site lives somewhere else.
5. Click the **Save** icon 💾.

## Step 2: Allow it to send from your Gmail

1. In the function menu next to **Run**, choose `doGet`, then click **Run**.
2. Google asks for permission. Click **Review permissions**, choose your account,
   then **Advanced**, then **Go to Bible Buddies Contact Form (unsafe)**, then **Allow**.
   It says "unsafe" only because you wrote the script yourself and Google
   hasn't reviewed it. It runs only in your account.

## Step 3: Publish it as a web app

1. Click **Deploy**, then **New deployment**.
2. Click the gear icon ⚙ next to "Select type" and choose **Web app**.
3. Fill in:
   - Description: `Contact form`
   - Execute as: **Me (biblebuddiesworld@gmail.com)**
   - Who has access: **Anyone**
4. Click **Deploy** and copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy.../exec`.
5. Optional check: open that URL in your browser. It should say
   "Bible Buddies contact form is running."

## Step 4: Connect the website

Send the Web app URL to your developer, or do it yourself:
open `contact.html`, find

```js
const APPS_SCRIPT_URL = "";
```

and paste the URL between the quotes. Publish the change (merge to `main`),
then send a test message from the Contact page.

## Changing the script later

If you edit `Code.gs` (for example, the welcome wording), the live form keeps
using the old version until you update the deployment:
**Deploy**, then **Manage deployments**, the pencil icon ✏, set **Version** to
**New version**, then **Deploy**. The URL stays the same.

## Where to check if something goes wrong

In the Apps Script editor, open **Executions** (in the left menu) to see
each message and any error.
