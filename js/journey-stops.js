/* =====================================================================
   BIBLE BUDDIES — journey-stops.js
   The stops on the "Journey with Jesus" walk, in the order they happen.

   Each stop:  place, emoji, title, ref (Bible passage), mood (time of day:
   day, dusk, night, storm, dark, dawn), paragraphs (what happened, with
   verse references) and verse (a quote from the World English Bible,
   which is public domain).

   The 3D scene for each stop is built in js/journey.js (function SCENES),
   using the stop's id. To change wording, just edit the text below.
   ===================================================================== */
const JOURNEY_CHAPTERS = [
  { title: "Jesus is born and grows up", from: 1 },
  { title: "Jesus begins His work", from: 7 },
  { title: "Miracles by the Sea of Galilee", from: 14 },
  { title: "The last week in Jerusalem", from: 24 },
  { title: "Jesus is alive!", from: 32 }
];

const JOURNEY_STOPS = [
  /* ---------- Jesus is born and grows up ---------- */
  { id: "nazareth-angel", place: "Nazareth", emoji: "👼", title: "An angel visits Mary", ref: "Luke 1:26–38; 2:4–5", mood: "day",
    paragraphs: [
      "God sent the angel Gabriel to Nazareth, a town in Galilee, to a young woman named Mary. She was engaged to Joseph, from the family of King David. (Luke 1:26–27)",
      "The angel told Mary that she would have a son and name Him Jesus. He would be called the Son of the Most High. Mary said, \"Behold, the servant of the Lord.\" (Luke 1:30–38)",
      "Later, Joseph and Mary left Nazareth and travelled to Bethlehem, the town of David, to be counted. (Luke 2:4–5)"
    ],
    verse: { text: "Don't be afraid, Mary, for you have found favor with God. Behold, you will conceive in your womb and give birth to a son, and shall name him 'Jesus.'", ref: "Luke 1:30–31" } },

  { id: "bethlehem", place: "Bethlehem", emoji: "⭐", title: "Jesus is born", ref: "Luke 2:1–20", mood: "night",
    paragraphs: [
      "While Mary and Joseph were in Bethlehem, Mary's baby was born. She wrapped Him in strips of cloth and laid Him in a manger, because there was no room for them in the inn. (Luke 2:6–7)",
      "That night an angel appeared to shepherds watching their sheep in the fields. The angel said, \"Don't be afraid,\" and told them the good news of a Savior. (Luke 2:8–14)",
      "The shepherds hurried to Bethlehem and found Mary, Joseph and the baby lying in the manger. Then they went back praising God. (Luke 2:15–20)"
    ],
    verse: { text: "For there is born to you today, in David's city, a Savior, who is Christ the Lord.", ref: "Luke 2:11" } },

  { id: "temple-presented", place: "Jerusalem Temple", emoji: "🕊️", title: "Jesus is presented at the Temple", ref: "Luke 2:22–38", mood: "day",
    paragraphs: [
      "Mary and Joseph brought baby Jesus to the Temple in Jerusalem to present Him to the Lord, and to offer a pair of turtledoves or two young pigeons. (Luke 2:22–24)",
      "A good man named Simeon was there. God had promised him that he would see the Christ. He took Jesus in his arms and praised God. (Luke 2:25–32)",
      "Anna, a very old prophetess who served God in the Temple day and night, also gave thanks and spoke about the child to everyone waiting for God's rescue. (Luke 2:36–38)"
    ],
    verse: { text: "for my eyes have seen your salvation,", ref: "Luke 2:30" } },

  { id: "egypt", place: "Egypt", emoji: "🐪", title: "Escape to Egypt", ref: "Matthew 2:13–15", mood: "day",
    paragraphs: [
      "An angel of the Lord appeared to Joseph in a dream and told him to take the child and His mother to Egypt, because King Herod wanted to harm the child. (Matthew 2:13)",
      "Joseph got up, took Jesus and Mary by night, and went to Egypt. (Matthew 2:14)",
      "They stayed in Egypt until King Herod died, just as the prophet had said. (Matthew 2:15)"
    ],
    verse: { text: "Out of Egypt I called my son.", ref: "Matthew 2:15" } },

  { id: "nazareth-home", place: "Nazareth", emoji: "🏠", title: "Jesus grows up in Nazareth", ref: "Matthew 2:19–23; Luke 2:39–40", mood: "day",
    paragraphs: [
      "After King Herod died, an angel told Joseph in a dream to go back to the land of Israel. (Matthew 2:19–21)",
      "The family went to live in the town of Nazareth in Galilee. (Matthew 2:22–23)",
      "There Jesus grew up. He became strong and full of wisdom, and God's grace was on Him. (Luke 2:39–40)"
    ],
    verse: { text: "The child was growing, and was becoming strong in spirit, being filled with wisdom, and the grace of God was upon him.", ref: "Luke 2:40" } },

  { id: "temple-boy", place: "Jerusalem Temple", emoji: "📖", title: "Young Jesus talks with the teachers", ref: "Luke 2:41–52", mood: "day",
    paragraphs: [
      "When Jesus was twelve years old, His family went to Jerusalem for the Passover feast. On the way home, Jesus stayed behind, but His parents did not know. (Luke 2:41–45)",
      "After three days they found Him in the Temple, sitting with the teachers, listening and asking questions. Everyone was amazed at how much He understood. (Luke 2:46–47)",
      "He went home to Nazareth and obeyed His parents, and He grew in wisdom and stature, and in favor with God and people. (Luke 2:51–52)"
    ],
    verse: { text: "Why were you looking for me? Didn't you know that I must be in my Father's house?", ref: "Luke 2:49" } },

  /* ---------- Jesus begins His work ---------- */
  { id: "jordan", place: "Jordan River", emoji: "🕊️", title: "Jesus is baptized by John", ref: "Matthew 3:13–17", mood: "day",
    paragraphs: [
      "John the Baptist preached in the wilderness and baptized people in the Jordan River, telling them to turn from their sins. (Matthew 3:1–6)",
      "Jesus came from Galilee to be baptized by John. John said, \"I need to be baptized by you,\" but Jesus asked him to do it, because it was right. (Matthew 3:13–15)",
      "As Jesus came up out of the water, the heavens opened. The Spirit of God came down like a dove and rested on Him, and a voice spoke from heaven. (Matthew 3:16–17)"
    ],
    verse: { text: "This is my beloved Son, with whom I am well pleased.", ref: "Matthew 3:17" } },

  { id: "wilderness", place: "The Wilderness", emoji: "🏜️", title: "Jesus is tempted in the wilderness", ref: "Matthew 4:1–11", mood: "day",
    paragraphs: [
      "The Spirit led Jesus into the wilderness. He fasted for forty days and forty nights, and He was hungry. (Matthew 4:1–2)",
      "The devil tempted Him three times: to turn stones into bread, to jump from the top of the Temple, and to worship him for all the kingdoms of the world. Each time Jesus answered with God's Word. (Matthew 4:3–10)",
      "Then the devil left Him, and angels came and served Him. (Matthew 4:11)"
    ],
    verse: { text: "Man shall not live by bread alone, but by every word that proceeds out of God's mouth.", ref: "Matthew 4:4" } },

  { id: "galilee-call", place: "Galilee", emoji: "🎣", title: "Jesus calls His first disciples", ref: "Matthew 4:18–22", mood: "day",
    paragraphs: [
      "Walking by the Sea of Galilee, Jesus saw two brothers, Simon Peter and Andrew, throwing a net into the sea. They were fishermen. (Matthew 4:18)",
      "Jesus said, \"Come after me, and I will make you fishers for men.\" At once they left their nets and followed Him. (Matthew 4:19–20)",
      "Further on He called James and John, who were mending nets in a boat with their father Zebedee. They left the boat and followed Jesus too. (Matthew 4:21–22)"
    ],
    verse: { text: "Come after me, and I will make you fishers for men.", ref: "Matthew 4:19" } },

  { id: "cana", place: "Cana", emoji: "🍇", title: "Jesus turns water into wine", ref: "John 2:1–11", mood: "day",
    paragraphs: [
      "There was a wedding in Cana of Galilee. Jesus, His mother and His disciples were invited. Then the wine ran out. (John 2:1–3)",
      "Mary told the servants, \"Whatever he says to you, do it.\" Jesus told them to fill six stone water jars with water, right to the brim. (John 2:5–7)",
      "When the person in charge of the feast tasted it, the water had become wine, the best wine of all! This was the first of Jesus' signs, and His disciples believed in Him. (John 2:8–11)"
    ],
    verse: { text: "Whatever he says to you, do it.", ref: "John 2:5" } },

  { id: "temple-cleansed", place: "Jerusalem Temple", emoji: "🛕", title: "Jesus cleanses the Temple", ref: "John 2:13–22", mood: "day",
    paragraphs: [
      "At Passover time, Jesus went to Jerusalem. In the Temple He found people selling oxen, sheep and doves, and money changers at their tables. (John 2:13–14)",
      "Jesus made a whip of cords, drove them all out and turned over the tables. He said, \"Don't make my Father's house a marketplace!\" (John 2:15–16)",
      "He said, \"Destroy this temple, and in three days I will raise it up.\" He was talking about His own body, and after He rose from the dead, His disciples remembered. (John 2:19–22)"
    ],
    verse: { text: "Take these things out of here! Don't make my Father's house a marketplace!", ref: "John 2:16" } },

  { id: "samaria", place: "Samaria", emoji: "💧", title: "Jesus meets the Samaritan woman", ref: "John 4:1–26", mood: "day",
    paragraphs: [
      "Tired from His journey, Jesus sat by Jacob's well in Samaria at about noon. A Samaritan woman came to draw water, and Jesus asked her, \"Give me a drink.\" (John 4:5–7)",
      "She was surprised, because Jews and Samaritans did not get along. Jesus told her about living water: whoever drinks the water He gives will never be thirsty again. (John 4:9–14)",
      "The woman said she knew the Messiah was coming. Jesus told her, \"I am he, the one who speaks to you.\" (John 4:25–26)"
    ],
    verse: { text: "Whoever drinks of the water that I will give him will never thirst again.", ref: "John 4:14" } },

  { id: "nazareth-synagogue", place: "Nazareth", emoji: "📜", title: "Jesus teaches in His hometown synagogue", ref: "Luke 4:16–30", mood: "day",
    paragraphs: [
      "Jesus came to Nazareth, where He grew up, and went to the synagogue on the Sabbath day. He stood up and read from the scroll of the prophet Isaiah. (Luke 4:16–19)",
      "He said, \"Today, this Scripture has been fulfilled in your hearing.\" The people wondered, \"Isn't this Joseph's son?\" (Luke 4:20–22)",
      "Later they became angry and took Him to the edge of the hill, but Jesus walked right through the middle of them and went on His way. (Luke 4:28–30)"
    ],
    verse: { text: "The Spirit of the Lord is on me, because he has anointed me to preach good news to the poor.", ref: "Luke 4:18" } },

  /* ---------- Miracles by the Sea of Galilee ---------- */
  { id: "capernaum-healing", place: "Capernaum", emoji: "🏠", title: "Jesus begins teaching and healing", ref: "Mark 1:21–34", mood: "dusk",
    paragraphs: [
      "In Capernaum, Jesus taught in the synagogue on the Sabbath. The people were amazed, because He taught with authority. (Mark 1:21–22)",
      "At Simon Peter's house, Simon's mother-in-law was sick with a fever. Jesus took her by the hand and helped her up, and the fever left her. (Mark 1:29–31)",
      "That evening, when the sun had set, the whole town gathered at the door, and Jesus healed many who were sick. (Mark 1:32–34)"
    ],
    verse: { text: "He healed many who were sick with various diseases.", ref: "Mark 1:34" } },

  { id: "storm", place: "Sea of Galilee", emoji: "🌊", title: "Jesus calms the storm", ref: "Mark 4:35–41", mood: "storm",
    paragraphs: [
      "One evening Jesus and His disciples set out across the lake in a boat. A great storm came, and the waves splashed into the boat. Jesus was asleep on a cushion. (Mark 4:35–38)",
      "The disciples woke Him: \"Teacher, don't you care that we are dying?\" Jesus stood up and said to the sea, \"Peace! Be still!\" The wind stopped and it was completely calm. (Mark 4:38–39)",
      "The disciples asked one another, \"Who then is this, that even the wind and the sea obey him?\" (Mark 4:41)"
    ],
    verse: { text: "Peace! Be still!", ref: "Mark 4:39" } },

  { id: "gadara", place: "Gadara", emoji: "🐷", title: "Jesus frees a man from evil spirits", ref: "Mark 5:1–20", mood: "day",
    paragraphs: [
      "Across the lake, in the country of the Gerasenes, a man troubled by evil spirits lived among the tombs. No one could help him. (Mark 5:1–5)",
      "Jesus commanded the spirits to come out of the man. They went into a large herd of pigs, and the pigs rushed down the steep bank into the sea. (Mark 5:8–13)",
      "People came and found the man sitting, dressed and in his right mind. Jesus told him, \"Go to your house, to your friends, and tell them what great things the Lord has done for you.\" (Mark 5:15–19)"
    ],
    verse: { text: "Go to your house, to your friends, and tell them what great things the Lord has done for you.", ref: "Mark 5:19" } },

  { id: "jairus", place: "Capernaum", emoji: "❤️", title: "Jesus heals Jairus' daughter", ref: "Mark 5:21–43", mood: "day",
    paragraphs: [
      "Jairus, a leader of the synagogue, begged Jesus to come, because his little daughter was dying. On the way, a woman who had been ill for twelve years touched Jesus' clothes and was healed. (Mark 5:22–34)",
      "Then messengers said the girl had died. Jesus told Jairus, \"Don't be afraid, only believe.\" (Mark 5:35–36)",
      "Jesus took the girl by the hand and said, \"Talitha cumi!\", which means, \"Girl, I tell you, get up!\" She got up and walked, and Jesus told them to give her something to eat. (Mark 5:41–43)"
    ],
    verse: { text: "Don't be afraid, only believe.", ref: "Mark 5:36" } },

  { id: "feeding", place: "Bethsaida", emoji: "🍞", title: "Jesus feeds 5,000 people", ref: "John 6:1–15; Luke 9:10", mood: "day",
    paragraphs: [
      "A huge crowd followed Jesus to a quiet place near the town of Bethsaida, by the Sea of Galilee. (Luke 9:10; John 6:1–5)",
      "A boy had five barley loaves and two fish. Jesus had the people sit down on the grass, gave thanks, and shared out the bread and fish. Everyone ate as much as they wanted. (John 6:9–11)",
      "About 5,000 men were fed, and the leftovers filled twelve baskets! (John 6:10–13)"
    ],
    verse: { text: "Jesus took the loaves; and having given thanks, he distributed to the disciples, and the disciples to those who were sitting down.", ref: "John 6:11" } },

  { id: "water-walk", place: "Sea of Galilee", emoji: "🌊", title: "Jesus walks on water", ref: "Matthew 14:22–33", mood: "night",
    paragraphs: [
      "Jesus sent His disciples ahead in a boat while He prayed on the mountain. In the night the wind was against them and the waves tossed the boat. (Matthew 14:22–24)",
      "Very early in the morning Jesus came to them, walking on the sea! They were frightened, but He said, \"Cheer up! It is I! Don't be afraid.\" (Matthew 14:25–27)",
      "Peter walked on the water toward Jesus, but when he saw the wind, he began to sink. Jesus caught him by the hand. When they got into the boat, the wind stopped. (Matthew 14:28–33)"
    ],
    verse: { text: "Cheer up! It is I! Don't be afraid.", ref: "Matthew 14:27" } },

  { id: "bread-of-life", place: "Capernaum", emoji: "🍞", title: "Jesus teaches about the Bread of Life", ref: "John 6:22–59", mood: "day",
    paragraphs: [
      "The next day the crowd went looking for Jesus and found Him in Capernaum. (John 6:22–25)",
      "Jesus told them not to work only for food that spoils, but for the food that lasts forever, which He gives. (John 6:26–27)",
      "In the synagogue in Capernaum He taught, \"I am the bread of life.\" (John 6:35, 6:59)"
    ],
    verse: { text: "I am the bread of life. Whoever comes to me will not be hungry, and whoever believes in me will never be thirsty.", ref: "John 6:35" } },

  { id: "caesarea", place: "Caesarea Philippi", emoji: "🪨", title: "Peter says Jesus is the Christ", ref: "Matthew 16:13–20", mood: "day",
    paragraphs: [
      "Near Caesarea Philippi, Jesus asked His disciples, \"Who do men say that I, the Son of Man, am?\" They said some thought He was John the Baptist, Elijah, or one of the prophets. (Matthew 16:13–14)",
      "Then He asked, \"But who do you say that I am?\" Simon Peter answered, \"You are the Christ, the Son of the living God.\" (Matthew 16:15–16)",
      "Jesus said God the Father had shown this to Peter, and said, \"On this rock I will build my assembly.\" (Matthew 16:17–18)"
    ],
    verse: { text: "You are the Christ, the Son of the living God.", ref: "Matthew 16:16" } },

  { id: "transfiguration", place: "The Mountain", emoji: "✨", title: "Jesus is transfigured", ref: "Matthew 17:1–8", mood: "day",
    paragraphs: [
      "Jesus took Peter, James and John up a high mountain. There His face shone like the sun and His clothes became as white as light. (Matthew 17:1–2)",
      "Moses and Elijah appeared and talked with Him. A bright cloud covered them, and a voice from the cloud spoke. (Matthew 17:3–5)",
      "The disciples fell down, afraid. Jesus touched them and said, \"Get up, and don't be afraid.\" When they looked up, they saw only Jesus. (Matthew 17:6–8)"
    ],
    verse: { text: "This is my beloved Son, in whom I am well pleased. Listen to him.", ref: "Matthew 17:5" } },

  { id: "greatest", place: "Galilee", emoji: "👦", title: "Who is the greatest?", ref: "Matthew 18:1–6", mood: "day",
    paragraphs: [
      "The disciples asked Jesus, \"Who then is greatest in the Kingdom of Heaven?\" (Matthew 18:1)",
      "Jesus called a little child and stood the child among them. He said they must turn and become like little children. (Matthew 18:2–3)",
      "Whoever is humble like this child is the greatest, and whoever welcomes a little child in Jesus' name welcomes Him. (Matthew 18:4–5)"
    ],
    verse: { text: "Whoever therefore humbles himself as this little child is the greatest in the Kingdom of Heaven.", ref: "Matthew 18:4" } },

  /* ---------- The last week in Jerusalem ---------- */
  { id: "bethany", place: "Bethany", emoji: "🏠", title: "Dinner with Martha, Mary and Lazarus", ref: "John 12:1–8", mood: "dusk",
    paragraphs: [
      "Six days before the Passover, Jesus came to Bethany, where Lazarus lived, whom Jesus had raised from the dead. They made Him a dinner. Martha served, and Lazarus sat at the table with Him. (John 12:1–2)",
      "Mary took a jar of very expensive perfume, poured it on Jesus' feet and wiped His feet with her hair. The whole house was filled with the smell of the perfume. (John 12:3)",
      "When Judas complained about the cost, Jesus said, \"Leave her alone.\" (John 12:4–7)"
    ],
    verse: { text: "The house was filled with the fragrance of the ointment.", ref: "John 12:3" } },

  { id: "entry", place: "Jerusalem", emoji: "🌿", title: "Jesus enters Jerusalem", ref: "Matthew 21:1–11", mood: "day",
    paragraphs: [
      "Near the Mount of Olives, Jesus sent two disciples to bring a donkey and its colt. Jesus rode toward Jerusalem. (Matthew 21:1–7)",
      "A very large crowd spread their clothes on the road, and others cut branches from the trees and spread them on the road. (Matthew 21:8)",
      "They shouted, \"Hosanna to the son of David!\" The whole city asked, \"Who is this?\" and the crowds said, \"This is the prophet, Jesus, from Nazareth of Galilee.\" (Matthew 21:9–11)"
    ],
    verse: { text: "Hosanna to the son of David! Blessed is he who comes in the name of the Lord! Hosanna in the highest!", ref: "Matthew 21:9" } },

  { id: "temple-teaching", place: "Jerusalem Temple", emoji: "🛕", title: "Jesus teaches in the Temple", ref: "Matthew 21:23–27", mood: "day",
    paragraphs: [
      "Jesus was teaching in the Temple. The chief priests and elders came and asked Him, \"By what authority do you do these things?\" (Matthew 21:23)",
      "Jesus answered with a question of His own: was John's baptism from heaven, or from people? (Matthew 21:24–25)",
      "They talked it over and said, \"We don't know.\" So Jesus said He would not tell them by what authority He did these things. (Matthew 21:25–27)"
    ],
    verse: { text: "By what authority do you do these things? Who gave you this authority?", ref: "Matthew 21:23" } },

  { id: "last-supper", place: "Jerusalem – Upper Room", emoji: "🍞", title: "Jesus shares the Last Supper", ref: "Luke 22:14–20", mood: "night",
    paragraphs: [
      "When the hour came, Jesus sat down with His twelve apostles in a large upper room to eat the Passover meal. (Luke 22:12–15)",
      "He took bread, gave thanks, broke it and gave it to them, saying, \"This is my body which is given for you. Do this in memory of me.\" (Luke 22:19)",
      "After supper He took the cup and said, \"This cup is the new covenant in my blood, which is poured out for you.\" (Luke 22:20)"
    ],
    verse: { text: "This is my body which is given for you. Do this in memory of me.", ref: "Luke 22:19" } },

  { id: "gethsemane", place: "Gethsemane", emoji: "🌳", title: "Jesus prays in the garden", ref: "Matthew 26:36–46", mood: "night",
    paragraphs: [
      "Jesus went with His disciples to a garden called Gethsemane. He took Peter, James and John further, and asked them to stay and watch with Him. (Matthew 26:36–38)",
      "Jesus went a little further, fell on His face and prayed to His Father. (Matthew 26:39)",
      "Three times He came back and found the disciples sleeping. Then He said, \"Arise, let's be going.\" (Matthew 26:40–46)"
    ],
    verse: { text: "My Father, if it is possible, let this cup pass away from me; nevertheless, not what I desire, but what you desire.", ref: "Matthew 26:39" } },

  { id: "trial", place: "Jerusalem", emoji: "⚖️", title: "Jesus is arrested and put on trial", ref: "Matthew 26:47–68", mood: "night",
    paragraphs: [
      "Judas came to the garden with a crowd carrying swords and clubs, and they arrested Jesus. All the disciples left Him and ran away. (Matthew 26:47–56)",
      "They took Jesus to Caiaphas, the high priest, where the leaders had gathered. Many people told lies about Him. (Matthew 26:57–61)",
      "The high priest asked if He was the Christ, the Son of God. Jesus answered, \"You have said it.\" The leaders said He deserved to die. (Matthew 26:63–66)"
    ],
    verse: { text: "Tell us whether you are the Christ, the Son of God.", ref: "Matthew 26:63" } },

  { id: "golgotha", place: "Golgotha", emoji: "✝️", title: "Jesus is crucified", ref: "Luke 23:32–49", mood: "dark",
    paragraphs: [
      "At the place called The Skull, they crucified Jesus, with two criminals, one on each side. Jesus said, \"Father, forgive them, for they don't know what they are doing.\" (Luke 23:33–34)",
      "One criminal said, \"Lord, remember me when you come into your Kingdom.\" Jesus promised, \"Today you will be with me in Paradise.\" (Luke 23:42–43)",
      "Darkness came over the whole land until three in the afternoon. Jesus cried out, \"Father, into your hands I commit my spirit!\" and died. His friends and the women watched from a distance. (Luke 23:44–49)"
    ],
    verse: { text: "Father, forgive them, for they don't know what they are doing.", ref: "Luke 23:34" } },

  { id: "tomb", place: "The Tomb", emoji: "🪨", title: "Jesus is placed in the tomb", ref: "Matthew 27:57–66", mood: "dusk",
    paragraphs: [
      "In the evening, a rich man named Joseph of Arimathea, a follower of Jesus, asked Pilate for Jesus' body. (Matthew 27:57–58)",
      "He wrapped the body in clean linen cloth and laid it in his own new tomb, cut out of the rock. He rolled a great stone against the door. (Matthew 27:59–60)",
      "The stone was sealed and soldiers were set to guard the tomb. (Matthew 27:62–66)"
    ],
    verse: { text: "and laid it in his own new tomb, which he had cut out in the rock, and he rolled a great stone against the door of the tomb.", ref: "Matthew 27:60" } },

  /* ---------- Jesus is alive! ---------- */
  { id: "empty-tomb", place: "The Empty Tomb", emoji: "🌅", title: "Jesus rises from the dead!", ref: "Matthew 28:1–10", mood: "dawn",
    travel: "fade", travelText: "Three days later, as the sun began to rise…",
    paragraphs: [
      "Early on the first day of the week, as it began to dawn, Mary Magdalene and the other Mary went to see the tomb. (Matthew 28:1)",
      "There was a great earthquake! An angel of the Lord came down, rolled away the stone and sat on it. He said, \"Don't be afraid… He is not here, for he has risen, just like he said.\" (Matthew 28:2–6)",
      "The women ran with fear and great joy to tell the disciples, and Jesus met them on the way! (Matthew 28:8–10)"
    ],
    verse: { text: "He is not here, for he has risen, just like he said. Come, see the place where the Lord was lying.", ref: "Matthew 28:6" } },

  { id: "emmaus", place: "Road to Emmaus", emoji: "🚶", title: "Jesus walks with two disciples", ref: "Luke 24:13–35", mood: "dusk",
    paragraphs: [
      "That same day, two disciples were walking to a village called Emmaus. Jesus came and walked with them, but they did not recognize Him. (Luke 24:13–16)",
      "Jesus explained to them everything the Scriptures said about Himself. As it was almost evening, they asked Him to stay. (Luke 24:27–29)",
      "At the table He took bread, gave thanks and broke it, and their eyes were opened. They knew it was Jesus! (Luke 24:30–31)"
    ],
    verse: { text: "Weren't our hearts burning within us, while he spoke to us along the way, and while he opened the Scriptures to us?", ref: "Luke 24:32" } },

  { id: "appears", place: "Jerusalem", emoji: "❤️", title: "Jesus appears to His disciples", ref: "Luke 24:36–49", mood: "night",
    paragraphs: [
      "While the disciples were talking together, Jesus Himself stood among them and said, \"Peace be to you.\" (Luke 24:36)",
      "They were frightened and thought they were seeing a spirit. Jesus showed them His hands and feet, and He ate a piece of broiled fish in front of them. (Luke 24:37–43)",
      "He opened their minds to understand the Scriptures and said, \"You are witnesses of these things.\" (Luke 24:45–48)"
    ],
    verse: { text: "Peace be to you.", ref: "Luke 24:36" } },

  { id: "breakfast", place: "Sea of Galilee", emoji: "🐟", title: "Breakfast by the sea", ref: "John 21:1–14", mood: "dawn",
    paragraphs: [
      "Peter and some disciples went fishing all night but caught nothing. At dawn Jesus stood on the shore, but they did not know it was Him. (John 21:3–4)",
      "He said, \"Cast the net on the right side of the boat.\" They caught so many fish they could not pull the net in! (John 21:6)",
      "On the shore was a fire of coals with fish and bread. Jesus said, \"Come and eat breakfast!\" (John 21:9–12)"
    ],
    verse: { text: "Cast the net on the right side of the boat, and you will find some.", ref: "John 21:6" } },

  { id: "commission", place: "Galilee Mountain", emoji: "⛰️", title: "Jesus gives the Great Commission", ref: "Matthew 28:16–20", mood: "day",
    paragraphs: [
      "The eleven disciples went to the mountain in Galilee where Jesus had told them to go. When they saw Him, they worshiped Him. (Matthew 28:16–17)",
      "Jesus said, \"All authority has been given to me in heaven and on earth.\" (Matthew 28:18)",
      "He told them to go and make disciples of all nations, and He promised, \"I am with you always.\" (Matthew 28:19–20)"
    ],
    verse: { text: "Go and make disciples of all nations… Behold, I am with you always, even to the end of the age.", ref: "Matthew 28:19–20" } },

  { id: "ascension", place: "Mount of Olives", emoji: "☁️", title: "Jesus ascends to heaven", ref: "Acts 1:6–12", mood: "day",
    paragraphs: [
      "Jesus told His disciples they would receive power when the Holy Spirit came, and would be His witnesses to the ends of the earth. (Acts 1:8)",
      "As they watched, He was taken up, and a cloud hid Him from their sight. (Acts 1:9)",
      "Two men in white clothing said Jesus would come back in the same way. The disciples returned to Jerusalem from the Mount of Olives. (Acts 1:10–12)"
    ],
    verse: { text: "This Jesus, who was received up from you into the sky, will come back in the same way as you saw him going into the sky.", ref: "Acts 1:11" } },

  { id: "pentecost", place: "Jerusalem", emoji: "🔥", title: "The Holy Spirit comes at Pentecost", ref: "Acts 2:1–4", mood: "day",
    paragraphs: [
      "On the day of Pentecost, the believers were all together in one place. (Acts 2:1)",
      "Suddenly a sound like a rushing mighty wind filled the house, and tongues like fire rested on each of them. (Acts 2:2–3)",
      "They were all filled with the Holy Spirit and began to speak in other languages. (Acts 2:4)"
    ],
    verse: { text: "They were all filled with the Holy Spirit, and began to speak with other languages, as the Spirit gave them the ability to speak.", ref: "Acts 2:4" } },

  { id: "peter-preaches", place: "Jerusalem", emoji: "👥", title: "The disciples share the Good News", ref: "Acts 2:14–41", mood: "day",
    paragraphs: [
      "Peter stood up with the other apostles and spoke loudly to the crowd. (Acts 2:14)",
      "He told them that God had raised Jesus from the dead, and that Jesus is Lord and Christ. (Acts 2:32–36)",
      "Peter said, \"Repent, and be baptized.\" About three thousand people believed and were baptized that day! (Acts 2:38–41)"
    ],
    verse: { text: "Then those who gladly received his word were baptized. There were added that day about three thousand souls.", ref: "Acts 2:41" } },

  { id: "damascus", place: "Road to Damascus", emoji: "✨", title: "Saul meets Jesus", ref: "Acts 9:1–19", mood: "day",
    paragraphs: [
      "Saul was travelling to Damascus to arrest followers of Jesus. Near the city, suddenly a light from the sky shone around him, and he fell to the ground. (Acts 9:1–4)",
      "A voice said, \"Saul, Saul, why do you persecute me?\" Saul asked, \"Who are you, Lord?\" The answer came: \"I am Jesus.\" (Acts 9:4–5)",
      "Saul could not see, and his friends led him by the hand into Damascus. After three days, God sent Ananias to him. Saul could see again, and he was baptized. (Acts 9:8–18)"
    ],
    verse: { text: "Who are you, Lord? … I am Jesus, whom you are persecuting.", ref: "Acts 9:5" } }
];
