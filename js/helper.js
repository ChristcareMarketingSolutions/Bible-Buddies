/* =====================================================================
   ASK BUDDY  — a friendly, offline Bible helper for children.

   HOW IT WORKS: it looks for words in what the child types and replies
   with a caring message, a Bible story, and a verse reference. It is
   NOT a real chat and NOTHING is sent anywhere. Everything stays inside
   the child's own browser. No names, no messages, and no data are saved
   or collected.

   TO ADD A TOPIC: copy one block in BIBLE_HELP and change the words,
   the reply, and the reference. The "keys" are little word-clues Buddy
   looks for (they match longer words too, so "scare" also finds
   "scared" and "scary").
   ===================================================================== */

const BIBLE_HELP = [
  { keys: ["scare", "afraid", "fear", "fright", "brave", "nervous"],
    reply: "Jesus once calmed a big storm when His friends were afraid. He is bigger than anything that scares you. When you feel scared, you can ask Jesus to help you be brave.",
    ref: "Mark 4:39 and Isaiah 41:10" },
  { keys: ["cant see", "can't see", "blind", "see well", "eyes"],
    reply: "A man named Bartimaeus could not see. He called out to Jesus, and Jesus helped him see again. You can ask Jesus for help too, and talk to a grown-up who cares for you.",
    ref: "Mark 10:51 to 52" },
  { keys: ["sad", "cry", "upset", "unhappy", "tears"],
    reply: "Jesus was sad too, and He even cried for His friend. He understands your tears and is always close to you. You can tell Jesus exactly how you feel.",
    ref: "John 11:35 and Psalm 34:18" },
  { keys: ["angry", "mad", "cross", "annoyed", "furious"],
    reply: "Even when people were unkind, Jesus chose to forgive. When you feel angry, take a slow deep breath and ask Jesus to help your heart feel calm again.",
    ref: "Luke 23:34 and Ephesians 4:26" },
  { keys: ["lonely", "alone", "no friend", "left out", "nobody"],
    reply: "Jesus made friends with people others ignored, like Zacchaeus in the tree. You are never truly alone, because Jesus promised to be with you always.",
    ref: "Luke 19:5 and Matthew 28:20" },
  { keys: ["worry", "worried", "anxious", "stress", "scared about"],
    reply: "Jesus said we do not need to worry, because God takes care of the little birds and cares even more for you. You can give your worries to Him.",
    ref: "Matthew 6:26 and 1 Peter 5:7" },
  { keys: ["sick", "ill", "unwell", "pain", "poorly"],
    reply: "Jesus healed many people who were sick. You can ask Jesus to help you feel better, and be sure to tell a grown-up who can look after you too.",
    ref: "Mark 1:34" },
  { keys: ["cant do", "can't do", "too hard", "give up", "fail", "difficult", "impossible"],
    reply: "David was small, but with God's help he did something that seemed impossible. With God helping you, you can be strong and keep trying.",
    ref: "1 Samuel 17 and Philippians 4:13" },
  { keys: ["lost", "cant find", "can't find", "missing"],
    reply: "Jesus told a story about a shepherd who searched everywhere for one lost sheep until he found it. God cares about even the little things, so you can ask Him to help.",
    ref: "Luke 15:4" },
  { keys: ["bully", "bullied", "mean", "unkind", "teasing", "picked on"],
    reply: "People were unkind to Jesus, but He stayed loving. If someone is being mean to you, please tell a teacher or a grown-up you trust, and ask Jesus to give you peace.",
    ref: "1 Peter 2:23" },
  { keys: ["thank", "happy", "grateful", "good day", "excited"],
    reply: "That is wonderful! We can say thank you to God for good things. Try telling God one thing you are thankful for today.",
    ref: "Psalm 107:1" },
  { keys: ["love", "loved", "does god", "god love"],
    reply: "God loves you so much that He sent Jesus for you. Nothing can ever stop God from loving you.",
    ref: "John 3:16 and Romans 8:38 to 39" },
  { keys: ["forgive", "sorry", "did wrong", "naughty", "mistake", "bad thing"],
    reply: "When we are sorry, Jesus forgives us, just like the father who ran to welcome his son home. You can tell Jesus you are sorry, and He will forgive you.",
    ref: "Luke 15:20" },
  { keys: ["pray", "how to pray", "talk to god", "prayer"],
    reply: "Jesus taught us that we can talk to God any time, like talking to a friend. You do not need special words. Just tell Him what is in your heart, and He always listens.",
    ref: "Matthew 6:9" },
  { keys: ["dark", "night", "sleep", "cant sleep", "can't sleep", "bad dream", "nightmare"],
    reply: "When it is dark, remember that God watches over you while you sleep. You can say a little prayer and rest safely in His care.",
    ref: "Psalm 4:8" },
  { keys: ["new", "first day", "school", "moving", "change"],
    reply: "God told Joshua to be strong and brave, because God would be with him everywhere he went. He is with you on new days too.",
    ref: "Joshua 1:9" }
];

/* Serious things go straight to a trusted grown-up (no story needed). */
const HELP_CONCERN = ["hurt me", "hit me", "touch me", "abuse", "unsafe", "not safe",
  "kill", "die", "harm myself", "hate myself", "want to die", "end my life"];

function initAskBuddy() {
  const log = document.querySelector("[data-chat-log]");
  if (!log) return;
  const input = document.querySelector("[data-chat-input]");
  const send  = document.querySelector("[data-chat-send]");
  const chips = document.querySelector("[data-chat-chips]");
  const CHIPS = ["I feel scared", "I feel sad", "I feel angry", "I feel lonely", "I am worried", "I am thankful"];

  function add(text, who, ref) {
    const d = document.createElement("div");
    d.className = "chat-msg " + who;
    d.textContent = text;
    if (ref) { const s = document.createElement("span"); s.className = "ref"; s.textContent = "Bible: " + ref; d.appendChild(s); }
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function reply(msg) {
    const t = " " + msg.toLowerCase() + " ";
    for (const c of HELP_CONCERN) {
      if (new RegExp("\\b" + esc(c) + "\\b").test(t)) {
        add("That sounds really important, and I care about you. Please tell a parent, a teacher, or a grown-up you trust right now, and let them help you. You are never alone, and you are loved. 🐑", "buddy", "Psalm 34:18");
        return;
      }
    }
    for (const item of BIBLE_HELP) {
      if (item.keys.some(k => t.includes(k))) { add(item.reply, "buddy", item.ref); return; }
    }
    add("Thank you for telling me! You can talk to Jesus about anything, just like a friend. Try tapping one of the feelings below, or ask a grown-up you trust to explore a Bible story with you. 🐑", "buddy", "Matthew 6:9");
  }
  function submit(text) {
    text = (text || "").trim();
    if (!text) return;
    add(text, "me");
    setTimeout(() => reply(text), 250);
  }
  send && send.addEventListener("click", () => { submit(input.value); input.value = ""; input.focus(); });
  input && input.addEventListener("keydown", e => { if (e.key === "Enter") { submit(input.value); input.value = ""; } });
  CHIPS.forEach(c => {
    const b = document.createElement("button");
    b.className = "chat-chip"; b.type = "button"; b.textContent = c;
    b.addEventListener("click", () => submit(c));
    chips && chips.appendChild(b);
  });
  add("Hi! I'm Buddy 🐑. Tell me how you feel or what you are wondering, and I'll find a Bible story to help.", "buddy");
}

document.addEventListener("DOMContentLoaded", initAskBuddy);
