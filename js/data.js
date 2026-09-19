/* =====================================================================
   BIBLE BUDDIES — data.js
   ALL your content lives here. To add a story, verse, character or quiz
   question, copy an existing block and edit it. No other file changes.

   Loaded as a plain script (not JSON) so the site also works when you
   just double-click the HTML files on your own computer.
   ===================================================================== */

/* ---------- BIBLE STORIES ---------- */
const STORIES = [
  { id: "calms-storm", title: "Jesus Calms the Storm", category: "Miracles of Jesus", emoji: "🌊",
    description: "Jesus shows His friends they can trust Him even when they are afraid.",
    readMins: 4, age: "Ages 5 to 9", comic: "", pdf: "" },
  { id: "feeds-5000", title: "Jesus Feeds the 5,000", category: "Miracles of Jesus", emoji: "🍞",
    description: "A boy's small lunch becomes a feast for thousands of people.",
    readMins: 5, age: "Ages 5 to 10", comic: "", pdf: "" },
  { id: "good-samaritan", title: "The Good Samaritan", category: "Parables", emoji: "🤝",
    description: "A kind traveller helps a stranger and teaches us how to love our neighbour.",
    readMins: 4, age: "Ages 6 to 11", comic: "", pdf: "" },
  { id: "lost-sheep", title: "The Lost Sheep", category: "Parables", emoji: "🐑",
    description: "A shepherd searches everywhere for one lost sheep. Every one matters!",
    readMins: 3, age: "Ages 4 to 8", comic: "", pdf: "" },
  { id: "jesus-born", title: "Jesus Is Born", category: "Jesus' Birth", emoji: "⭐",
    description: "In a little town called Bethlehem, the Saviour of the world is born.",
    readMins: 5, age: "Ages 4 to 10", comic: "", pdf: "" },
  { id: "noahs-ark", title: "Noah's Ark", category: "Old Testament", emoji: "🌈",
    description: "Noah builds a giant boat and God keeps his family and the animals safe.",
    readMins: 6, age: "Ages 4 to 9", comic: "", pdf: "" },
  { id: "david-goliath", title: "David and Goliath", category: "Bible Heroes", emoji: "🪨",
    description: "A brave young shepherd trusts God to face a giant.",
    readMins: 5, age: "Ages 6 to 11", comic: "", pdf: "" },
  { id: "walks-water", title: "Jesus Walks on Water", category: "Miracles of Jesus", emoji: "🌟",
    description: "Peter learns to keep his eyes on Jesus, even on the waves.",
    readMins: 4, age: "Ages 6 to 10", comic: "", pdf: "" },
  { id: "zacchaeus", title: "Zacchaeus Meets Jesus", category: "Stories About Jesus", emoji: "🌳",
    description: "A small man climbs a tree and his whole life is changed by Jesus' kindness.",
    readMins: 4, age: "Ages 5 to 10", comic: "", pdf: "" },
  { id: "resurrection", title: "The Resurrection", category: "Easter", emoji: "✝️",
    description: "The tomb is empty and Jesus is alive! The happiest morning ever.",
    readMins: 5, age: "Ages 6 to 11", comic: "", pdf: "" }
];

const STORY_CATEGORIES = [
  "Stories About Jesus", "Miracles of Jesus", "Parables", "Jesus' Birth",
  "Old Testament", "New Testament", "Bible Heroes", "Easter", "God's Love"
];

/* ---------- MEMORY VERSES ---------- */
const VERSES = [
  { text: "For God so loved the world that he gave his one and only Son.", ref: "John 3:16",
    explain: "God loves you so much that He sent Jesus for you." },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1",
    explain: "God takes care of us like a shepherd cares for his sheep." },
  { text: "Be strong and courageous. Do not be afraid.", ref: "Joshua 1:9",
    explain: "We can be brave because God is always with us." },
  { text: "Let the little children come to me.", ref: "Matthew 19:14",
    explain: "Jesus loves children and wants them close to Him." },
  { text: "Love one another as I have loved you.", ref: "John 13:34",
    explain: "Jesus asks us to be kind and loving to everyone." },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13",
    explain: "With God's help we can do hard things." },
  { text: "Give thanks to the Lord, for he is good.", ref: "Psalm 107:1",
    explain: "We say thank you to God for all the good things He gives." },
  { text: "Trust in the Lord with all your heart.", ref: "Proverbs 3:5",
    explain: "We can trust God even when we don't understand everything." }
];

/* ---------- BIBLE CHARACTERS (Explorer) ---------- */
const CHARACTERS = [
  { id: "jesus", name: "Jesus", emoji: "✝️", who: "The Son of God, our Saviour and friend.",
    lesson: "Jesus shows us God's love and teaches us how to live." },
  { id: "noah", name: "Noah", emoji: "🚢", who: "A man who obeyed God and built the ark.",
    lesson: "Obeying God keeps us safe, even when others don't understand." },
  { id: "david", name: "David", emoji: "🎯", who: "A shepherd boy who became a king.",
    lesson: "God can use anyone who trusts Him, even the small and young." },
  { id: "moses", name: "Moses", emoji: "🌊", who: "The leader who guided God's people out of Egypt.",
    lesson: "God hears His people and rescues them." },
  { id: "mary", name: "Mary", emoji: "💙", who: "The mother of Jesus, who trusted God's plan.",
    lesson: "Saying yes to God is always the right choice." },
  { id: "peter", name: "Peter", emoji: "🐟", who: "A fisherman who became one of Jesus' closest friends.",
    lesson: "Jesus loves us even when we make mistakes." }
];

/* ---------- BIBLE PLACES ---------- */
const PLACES = [
  { name: "Bethlehem", emoji: "🏠", note: "The little town where Jesus was born." },
  { name: "Nazareth", emoji: "🌿", note: "The town where Jesus grew up." },
  { name: "Galilee", emoji: "🌊", note: "The lake where Jesus called His disciples and calmed a storm." },
  { name: "Jerusalem", emoji: "🛤️", note: "The great city where many important events happened." }
];

/* ---------- MEET JESUS JOURNEY ---------- */
const JESUS_JOURNEY = [
  "Jesus' Birth", "His Childhood", "Baptism", "Calling His Disciples",
  "His Teachings", "His Miracles", "His Parables", "His Friends",
  "Jerusalem", "Crucifixion", "Resurrection", "The Great Commission"
];

/* ---------- WHAT DID JESUS TEACH ---------- */
const TEACHINGS = [
  { emoji: "❤️", title: "Love", text: "Love God and love other people, even people who are different from us." },
  { emoji: "🙏", title: "Prayer", text: "We can talk to God any time. He always listens." },
  { emoji: "🤝", title: "Forgiveness", text: "When someone is sorry, we forgive them, just as God forgives us." },
  { emoji: "💛", title: "Kindness", text: "Small acts of kindness make God happy and help others." },
  { emoji: "🕊️", title: "Peace", text: "Jesus gives us peace in our hearts, even on hard days." },
  { emoji: "🌱", title: "Faith", text: "Even faith as small as a seed can grow into something big." }
];

/* ---------- GAME: MEMORY MATCH (name paired with symbol) ---------- */
const MEMORY_PAIRS = [
  { a: "Noah",   b: "🚢", label: "Ark" },
  { a: "David",  b: "🎯", label: "Sling" },
  { a: "Moses",  b: "🌊", label: "Red Sea" },
  { a: "Jesus",  b: "✝️", label: "Cross" },
  { a: "Peter",  b: "🐟", label: "Fish" },
  { a: "Jonah",  b: "🐋", label: "Whale" },
  { a: "Daniel", b: "🦁", label: "Lions" },
  { a: "Joseph", b: "🧥", label: "Coat" }
];

/* ---------- GAME: WHO AM I?  (50+ clues) ---------- */
const WHO_AM_I = [
  { clue: "I built a big boat called an ark.\nAnimals came to me two by two.\nWho am I?", answer: "Noah", options: ["Noah", "Moses", "David", "Paul"] },
  { clue: "I was a young shepherd boy.\nI trusted God and beat a giant.\nWho am I?", answer: "David", options: ["David", "Jonah", "Peter", "Adam"] },
  { clue: "A big fish swallowed me.\nAfter three days I obeyed God.\nWho am I?", answer: "Jonah", options: ["Jonah", "Noah", "Elijah", "Moses"] },
  { clue: "I led God's people out of Egypt.\nGod parted the sea for us.\nWho am I?", answer: "Moses", options: ["Moses", "Aaron", "Joshua", "David"] },
  { clue: "I was the very first man God made.\nI lived in the garden of Eden.\nWho am I?", answer: "Adam", options: ["Adam", "Cain", "Noah", "Seth"] },
  { clue: "I was the first woman God made.\nI lived in the garden with Adam.\nWho am I?", answer: "Eve", options: ["Eve", "Sarah", "Ruth", "Mary"] },
  { clue: "God promised me a family like the stars.\nI trusted God and left my home.\nWho am I?", answer: "Abraham", options: ["Abraham", "Isaac", "Jacob", "Noah"] },
  { clue: "I was the promised son of Abraham.\nMy name means laughter.\nWho am I?", answer: "Isaac", options: ["Isaac", "Jacob", "Joseph", "Esau"] },
  { clue: "I had twelve sons.\nGod gave me a new name, Israel.\nWho am I?", answer: "Jacob", options: ["Jacob", "Isaac", "Joseph", "Moses"] },
  { clue: "My brothers sold me, but God had a plan.\nI wore a colourful coat.\nWho am I?", answer: "Joseph", options: ["Joseph", "Daniel", "Benjamin", "Judah"] },
  { clue: "I was thrown into a den of lions.\nGod kept me safe all night.\nWho am I?", answer: "Daniel", options: ["Daniel", "David", "Jonah", "Samuel"] },
  { clue: "I was very strong.\nMy strength was in my long hair.\nWho am I?", answer: "Samson", options: ["Samson", "Goliath", "Saul", "Gideon"] },
  { clue: "I led the people around Jericho.\nThe city walls fell down flat.\nWho am I?", answer: "Joshua", options: ["Joshua", "Caleb", "Moses", "Aaron"] },
  { clue: "I was a prophet of God.\nGod answered me with fire from heaven.\nWho am I?", answer: "Elijah", options: ["Elijah", "Elisha", "Isaiah", "Samuel"] },
  { clue: "I was a brave queen.\nI helped save my whole people.\nWho am I?", answer: "Esther", options: ["Esther", "Ruth", "Deborah", "Mary"] },
  { clue: "I stayed loyal to Naomi.\nI followed her and her God.\nWho am I?", answer: "Ruth", options: ["Ruth", "Esther", "Rachel", "Leah"] },
  { clue: "I asked God for wisdom.\nI built the great temple.\nWho am I?", answer: "Solomon", options: ["Solomon", "David", "Saul", "Samuel"] },
  { clue: "God made my small army win.\nWe used trumpets and torches.\nWho am I?", answer: "Gideon", options: ["Gideon", "Samson", "Joshua", "Barak"] },
  { clue: "An angel told me I would have a special baby.\nI am the mother of Jesus.\nWho am I?", answer: "Mary", options: ["Mary", "Martha", "Elizabeth", "Anna"] },
  { clue: "I was a carpenter in Nazareth.\nI cared for baby Jesus and Mary.\nWho am I?", answer: "Joseph", options: ["Joseph", "Peter", "Zechariah", "Simeon"] },
  { clue: "I baptised people in the Jordan River.\nI told everyone Jesus was coming.\nWho am I?", answer: "John the Baptist", options: ["John the Baptist", "Peter", "Paul", "Andrew"] },
  { clue: "I was a fisherman.\nJesus said I would fish for people.\nWho am I?", answer: "Peter", options: ["Peter", "John", "James", "Philip"] },
  { clue: "I once hurt Christians, then I met Jesus.\nI wrote many letters in the Bible.\nWho am I?", answer: "Paul", options: ["Paul", "Peter", "Luke", "Silas"] },
  { clue: "I was very short.\nI climbed a tree to see Jesus.\nWho am I?", answer: "Zacchaeus", options: ["Zacchaeus", "Matthew", "Nicodemus", "Bartholomew"] },
  { clue: "I was sick and died.\nJesus called me out of the tomb alive.\nWho am I?", answer: "Lazarus", options: ["Lazarus", "Jairus", "Simon", "Thomas"] },
  { clue: "I was busy serving in my house.\nMy sister sat and listened to Jesus.\nWho am I?", answer: "Martha", options: ["Martha", "Mary", "Joanna", "Salome"] },
  { clue: "I doubted that Jesus had risen.\nThen I saw Him and believed.\nWho am I?", answer: "Thomas", options: ["Thomas", "Peter", "Judas", "Philip"] },
  { clue: "I collected taxes for money.\nJesus called me to follow Him.\nWho am I?", answer: "Matthew", options: ["Matthew", "Mark", "Luke", "John"] },
  { clue: "I came to Jesus at night with questions.\nHe told me to be born again.\nWho am I?", answer: "Nicodemus", options: ["Nicodemus", "Zacchaeus", "Joseph", "Simon"] },
  { clue: "I was a giant soldier.\nA shepherd boy defeated me.\nWho am I?", answer: "Goliath", options: ["Goliath", "Saul", "Samson", "Og"] },
  { clue: "I laughed when God said I would have a baby.\nI became the mother of Isaac.\nWho am I?", answer: "Sarah", options: ["Sarah", "Rebekah", "Hannah", "Rachel"] },
  { clue: "I watched my baby brother float in a basket.\nHe grew up to lead Israel.\nWho am I?", answer: "Miriam", options: ["Miriam", "Deborah", "Rahab", "Zipporah"] },
  { clue: "I was the brother of Moses.\nI became the first high priest.\nWho am I?", answer: "Aaron", options: ["Aaron", "Hur", "Joshua", "Caleb"] },
  { clue: "I hid the spies in Jericho.\nA red cord kept my family safe.\nWho am I?", answer: "Rahab", options: ["Rahab", "Ruth", "Deborah", "Jael"] },
  { clue: "I helped rebuild the walls of Jerusalem.\nWe worked with tools and courage.\nWho am I?", answer: "Nehemiah", options: ["Nehemiah", "Ezra", "Haggai", "Daniel"] },
  { clue: "I lost so much but kept trusting God.\nIn the end God blessed me again.\nWho am I?", answer: "Job", options: ["Job", "Jonah", "Jeremiah", "Hosea"] },
  { clue: "I was Peter's brother and a fisherman.\nI liked to bring people to Jesus.\nWho am I?", answer: "Andrew", options: ["Andrew", "James", "John", "Philip"] },
  { clue: "I was the first to give my life for Jesus.\nI forgave the people who hurt me.\nWho am I?", answer: "Stephen", options: ["Stephen", "Paul", "Barnabas", "Philip"] },
  { clue: "My name means son of encouragement.\nI travelled with Paul.\nWho am I?", answer: "Barnabas", options: ["Barnabas", "Silas", "Timothy", "Mark"] },
  { clue: "I was a Roman soldier.\nGod sent Peter to tell me about Jesus.\nWho am I?", answer: "Cornelius", options: ["Cornelius", "Pilate", "Herod", "Felix"] },
  { clue: "I was a synagogue leader.\nJesus brought my little girl back to life.\nWho am I?", answer: "Jairus", options: ["Jairus", "Lazarus", "Nicodemus", "Simon"] },
  { clue: "I was a young helper of Paul.\nHe wrote me two letters.\nWho am I?", answer: "Timothy", options: ["Timothy", "Titus", "Silas", "Luke"] },
  { clue: "I was a doctor who followed Jesus.\nI wrote a Gospel and the book of Acts.\nWho am I?", answer: "Luke", options: ["Luke", "Mark", "Matthew", "John"] },
  { clue: "I followed the prophet Elijah.\nI did many miracles for God.\nWho am I?", answer: "Elisha", options: ["Elisha", "Elijah", "Isaiah", "Amos"] },
  { clue: "As a boy I heard God call my name.\nI said, speak, your servant is listening.\nWho am I?", answer: "Samuel", options: ["Samuel", "Saul", "David", "Eli"] },
  { clue: "I was a wise judge and leader.\nI helped Israel win a great battle.\nWho am I?", answer: "Deborah", options: ["Deborah", "Esther", "Ruth", "Miriam"] },
  { clue: "I was born in Bethlehem.\nI am the Son of God and Saviour.\nWho am I?", answer: "Jesus", options: ["Jesus", "John", "Isaac", "Moses"] },
  { clue: "I was old and waited to see the Saviour.\nI held baby Jesus in the temple.\nWho am I?", answer: "Simeon", options: ["Simeon", "Zechariah", "Joseph", "Eli"] },
  { clue: "Jesus asked me how to feed a big crowd.\nLater I shared the good news far away.\nWho am I?", answer: "Philip", options: ["Philip", "Andrew", "Thomas", "James"] },
  { clue: "I was the first son of Adam and Eve.\nI worked as a farmer.\nWho am I?", answer: "Cain", options: ["Cain", "Abel", "Seth", "Enoch"] },
  { clue: "I was a shepherd, a son of Adam and Eve.\nI gave God my very best gift.\nWho am I?", answer: "Abel", options: ["Abel", "Cain", "Seth", "Noah"] }
];

/* ---------- GAME: WORD SCRAMBLE (60 words) ---------- */
const SCRAMBLE_WORDS = [
  "JESUS", "MOSES", "NOAH", "DAVID", "MARY", "JOSEPH", "PETER", "PAUL", "JOHN", "ADAM",
  "ABRAHAM", "ISAAC", "JACOB", "JONAH", "DANIEL", "ESTHER", "RUTH", "SAMSON", "GIDEON", "JOSHUA",
  "ELIJAH", "SOLOMON", "ANGEL", "ARK", "DOVE", "OLIVE", "RAINBOW", "MANNA", "BREAD", "FISH",
  "LAMB", "SHEEP", "SHEPHERD", "CROSS", "CROWN", "HEAVEN", "PRAYER", "FAITH", "HOPE", "LOVE",
  "PEACE", "GRACE", "LIGHT", "WATER", "WINE", "STAR", "MANGER", "DONKEY", "CAMEL", "TEMPLE",
  "PSALM", "GOSPEL", "MIRACLE", "PARABLE", "KINGDOM", "GARDEN", "TRUMPET", "HARP", "VINE", "WHEAT"
];

/* ---------- GAME: BIBLE QUIZ (50+ questions) ---------- */
const QUIZ = [
  { q: "Who built the ark?", options: ["Moses", "Noah", "David", "Paul"], answer: 1 },
  { q: "In which town was Jesus born?", options: ["Nazareth", "Jerusalem", "Bethlehem", "Jericho"], answer: 2 },
  { q: "How many people did Jesus feed with five loaves and two fish?", options: ["500", "5,000", "50", "100"], answer: 1 },
  { q: "Who calmed the storm on the lake?", options: ["Peter", "John", "Jesus", "David"], answer: 2 },
  { q: "What did the Good Samaritan do?", options: ["Ran away", "Helped a hurt stranger", "Went fishing", "Fell asleep"], answer: 1 },
  { q: "Who was swallowed by a big fish?", options: ["Jonah", "Noah", "Moses", "Peter"], answer: 0 },
  { q: "What did David use against Goliath?", options: ["A sword", "A sling and a stone", "A spear", "A shield"], answer: 1 },
  { q: "On Easter morning the tomb was...", options: ["Locked", "Empty", "Full", "Hidden"], answer: 1 },
  { q: "Who led God's people out of Egypt?", options: ["Aaron", "Joshua", "Moses", "David"], answer: 2 },
  { q: "On the first day, what did God create?", options: ["Animals", "Light", "People", "Fish"], answer: 1 },
  { q: "In how many days did God make the world?", options: ["Three", "Six", "Seven", "Ten"], answer: 1 },
  { q: "Who was the first man?", options: ["Noah", "Adam", "Cain", "Abraham"], answer: 1 },
  { q: "Who was the first woman?", options: ["Mary", "Sarah", "Eve", "Ruth"], answer: 2 },
  { q: "In which garden did Adam and Eve live?", options: ["Eden", "Gethsemane", "Babylon", "Canaan"], answer: 0 },
  { q: "Who received the Ten Commandments from God?", options: ["David", "Moses", "Elijah", "Paul"], answer: 1 },
  { q: "How many commandments did God give?", options: ["Five", "Seven", "Ten", "Twelve"], answer: 2 },
  { q: "Who baptised Jesus?", options: ["Peter", "John the Baptist", "Paul", "Andrew"], answer: 1 },
  { q: "In which river was Jesus baptised?", options: ["Nile", "Jordan", "Euphrates", "Galilee"], answer: 1 },
  { q: "What did the wise men follow to find Jesus?", options: ["A map", "A star", "An angel", "A bird"], answer: 1 },
  { q: "How many disciples did Jesus choose?", options: ["Seven", "Ten", "Twelve", "Three"], answer: 2 },
  { q: "Who denied Jesus three times?", options: ["Judas", "Peter", "Thomas", "John"], answer: 1 },
  { q: "Who betrayed Jesus?", options: ["Peter", "Judas", "Thomas", "Paul"], answer: 1 },
  { q: "What did Jesus turn water into?", options: ["Bread", "Wine", "Oil", "Milk"], answer: 1 },
  { q: "Who walked on the water toward Jesus?", options: ["John", "Peter", "James", "Andrew"], answer: 1 },
  { q: "Who was thrown into the lions' den?", options: ["Daniel", "David", "Jonah", "Samuel"], answer: 0 },
  { q: "Whose walls fell down after the people marched?", options: ["Jerusalem", "Jericho", "Babylon", "Nineveh"], answer: 1 },
  { q: "Which brave queen saved her people?", options: ["Ruth", "Esther", "Mary", "Sarah"], answer: 1 },
  { q: "Who climbed a tree to see Jesus?", options: ["Matthew", "Zacchaeus", "Nicodemus", "Peter"], answer: 1 },
  { q: "Whom did Jesus raise from the dead?", options: ["Lazarus", "Judas", "John", "Paul"], answer: 0 },
  { q: "What animal did Jesus ride into Jerusalem?", options: ["A horse", "A camel", "A donkey", "A sheep"], answer: 2 },
  { q: "What did Jesus share at the Last Supper?", options: ["Bread and wine", "Fish and chips", "Milk and honey", "Figs"], answer: 0 },
  { q: "What is the first book of the Bible?", options: ["Exodus", "Genesis", "Psalms", "Matthew"], answer: 1 },
  { q: "What is the last book of the Bible?", options: ["Acts", "Jude", "Revelation", "John"], answer: 2 },
  { q: "Which book is full of songs and prayers?", options: ["Psalms", "Kings", "Ruth", "Mark"], answer: 0 },
  { q: "Who was the mother of Jesus?", options: ["Martha", "Mary", "Elizabeth", "Anna"], answer: 1 },
  { q: "What was Joseph, the husband of Mary, by trade?", options: ["Fisherman", "Carpenter", "Farmer", "Shepherd"], answer: 1 },
  { q: "In which town did Jesus grow up?", options: ["Bethlehem", "Nazareth", "Capernaum", "Jerusalem"], answer: 1 },
  { q: "What food did God send from heaven for Israel?", options: ["Manna", "Bread", "Rice", "Corn"], answer: 0 },
  { q: "Who was the very strong man in the Bible?", options: ["Samson", "Saul", "Gideon", "Goliath"], answer: 0 },
  { q: "Who was the wisest king of Israel?", options: ["David", "Solomon", "Saul", "Hezekiah"], answer: 1 },
  { q: "Who built the temple in Jerusalem?", options: ["David", "Solomon", "Nehemiah", "Ezra"], answer: 1 },
  { q: "What sign did God give Noah after the flood?", options: ["A star", "A rainbow", "A cloud", "A dove"], answer: 1 },
  { q: "How did Noah know the flood was over?", options: ["A dove brought a leaf", "He guessed", "An angel told him", "The ark stopped"], answer: 0 },
  { q: "Who had a coat of many colours?", options: ["Joseph", "Jacob", "Daniel", "Aaron"], answer: 0 },
  { q: "As a baby, where was Moses hidden?", options: ["In a cave", "In a basket on the river", "In a barn", "In a tree"], answer: 1 },
  { q: "What spoke to Moses on the mountain?", options: ["A burning bush", "A cloud", "An angel", "A lamb"], answer: 0 },
  { q: "How many plagues did God send on Egypt?", options: ["Three", "Seven", "Ten", "Twelve"], answer: 2 },
  { q: "Who was Abraham's promised son?", options: ["Isaac", "Jacob", "Ishmael", "Esau"], answer: 0 },
  { q: "What is the greatest commandment Jesus gave?", options: ["Love God and love others", "Work hard", "Stay quiet", "Be rich"], answer: 0 },
  { q: "Who was first to see Jesus alive on Easter?", options: ["Mary Magdalene", "Peter", "John", "Thomas"], answer: 0 },
  { q: "Who told Mary she would have baby Jesus?", options: ["A shepherd", "An angel", "A wise man", "A friend"], answer: 1 },
  { q: "How many wise men gifts are named in the Bible?", options: ["Two", "Three", "Four", "Five"], answer: 1 }
];

/* ---------- SEARCH INDEX (built from the data above) ---------- */
function buildSearchIndex() {
  const idx = [];
  STORIES.forEach(s => idx.push({ icon: "📖", title: s.title, kind: "Story", url: "stories.html", key: (s.title + " " + s.category + " " + s.description).toLowerCase() }));
  CHARACTERS.forEach(c => idx.push({ icon: "👤", title: c.name, kind: "Bible Character", url: "explorer.html", key: (c.name + " " + c.who).toLowerCase() }));
  PLACES.forEach(p => idx.push({ icon: "🗺️", title: p.name, kind: "Bible Place", url: "explorer.html", key: (p.name + " " + p.note).toLowerCase() }));
  VERSES.forEach(v => idx.push({ icon: "⭐", title: v.ref, kind: "Memory Verse", url: "memory-verses.html", key: (v.ref + " " + v.text).toLowerCase() }));
  idx.push({ icon: "🎮", title: "Bible Memory Match", kind: "Game", url: "games.html", key: "memory match game cards pairs" });
  idx.push({ icon: "🎮", title: "Who Am I?", kind: "Game", url: "games.html", key: "who am i clue guess character game" });
  idx.push({ icon: "🎮", title: "Word Scramble", kind: "Game", url: "games.html", key: "word scramble letters game" });
  idx.push({ icon: "🎮", title: "Bible Quiz", kind: "Game", url: "games.html", key: "quiz questions multiple choice game" });
  return idx;
}
