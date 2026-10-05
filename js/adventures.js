/* =====================================================================
   BIBLE BUDDIES — adventures.js
   "Today's Bible Adventure" on the home page. One adventure is shown each
   day, in this order, then the list starts again.

   Each adventure:
     story     – the story, one paragraph per line in the list
     fact      – a "Did you know?" fact
     question  – a quick quiz: q, three choices, and answer (0, 1 or 2)
     challenge – something to do today
   To add an adventure, copy a whole { ... } block and edit it.
   ===================================================================== */
const ADVENTURES = [
  {
    id: "creation", emoji: "🌍", title: "God Makes Everything", ref: "Genesis 1–2",
    story: [
      "In the very beginning there was nothing at all: no sky, no land, no animals and no people. But God was there, and God had a wonderful plan.",
      "On the first day God said, \"Let there be light,\" and there was light! He called the light \"day\" and the darkness \"night.\" On the second day He made the sky, and on the third day He gathered the waters into seas so dry land appeared. Then He filled the land with grass, flowers and trees full of fruit.",
      "On the fourth day God put the sun, the moon and the stars in the sky. On the fifth day He filled the seas with fish and the sky with birds. On the sixth day He made all kinds of animals, from tiny bugs to huge, heavy ones.",
      "Then God did something extra special. He made the first man, Adam, from the dust of the ground and breathed life into him. Later He made the first woman, Eve. God made people in His own image, so they could know Him, love Him and take care of His world.",
      "God looked at everything He had made, and it was very good! On the seventh day God rested from all His work and made that day holy. Every sunrise, every flower and every person reminds us how great and kind our Creator is."
    ],
    fact: "The Bible says God made everything just by speaking. He said, \"Let there be…\" and it happened!",
    question: { q: "On which day did God rest?", choices: ["The third day", "The seventh day", "The first day"], answer: 1 },
    challenge: "Go outside and find three things God made. Say \"Thank You, God!\" for each one."
  },
  {
    id: "noah", emoji: "🌈", title: "Noah's Ark", ref: "Genesis 6–9",
    story: [
      "Long ago, people on the earth stopped listening to God and filled the world with wrong and unkind things. But there was one man who loved God and walked with Him. His name was Noah.",
      "God told Noah, \"Build a huge boat, an ark, out of wood.\" God gave him the exact size and shape. Noah had never seen a flood like the one God warned about, but he trusted God and did everything God told him to do.",
      "When the ark was ready, the animals came, two by two, a male and a female of every kind, and seven pairs of some. Noah, his wife, his three sons and their wives went inside, and God shut the door.",
      "Then the rain began. It rained for forty days and forty nights, and the water covered even the tallest mountains. Outside everything was flooded, but inside the ark Noah's family and the animals were safe, because God remembered them.",
      "After many months the ark came to rest on the mountains of Ararat. Noah sent out a dove, and one day it came back with a fresh olive leaf in its beak. The land was drying!",
      "When everyone stepped out of the ark, Noah thanked God. God put a beautiful rainbow in the clouds and promised never again to destroy the whole earth with a flood. Every rainbow reminds us that God keeps His promises."
    ],
    fact: "It rained for 40 days, but Noah's family stayed in the ark for about a year before the land was dry enough.",
    question: { q: "What did the dove bring back to Noah?", choices: ["A fish", "An olive leaf", "A flower"], answer: 1 },
    challenge: "Keep a promise today, just like God always keeps His promises."
  },
  {
    id: "abraham", emoji: "✨", title: "God's Big Promise to Abraham", ref: "Genesis 12; 15; 21",
    story: [
      "Abram lived in a city called Haran with his wife Sarai. One day God spoke to him: \"Leave your country and your family's home and go to the land I will show you. I will bless you and make you into a great nation.\"",
      "That was a big thing to ask! Abram did not even know where he was going. But he trusted God. He packed up his tents, his animals and everything he had, and he set off with Sarai and his nephew Lot.",
      "Abram and Sarai were already old, and they had no children. One night God took Abram outside and said, \"Look up at the sky and count the stars, if you can. That is how many people will come from your family.\" Abram believed God, and God was pleased with his faith.",
      "God gave Abram a new name, Abraham, which means \"father of many.\" Sarai became Sarah. Years went by, and still they waited. When God's messengers said Sarah would have a baby, she laughed, because she was about ninety years old!",
      "But nothing is too hard for God. Just as He promised, Sarah had a baby boy when Abraham was one hundred years old. They named him Isaac, which means \"laughter,\" because God had filled their home with joy.",
      "From Abraham's family came the people of Israel, and many years later Jesus was born into that family. God's promise to Abraham was a blessing for the whole world."
    ],
    fact: "Abraham was 100 years old and Sarah was 90 when their son Isaac was born!",
    question: { q: "What did God tell Abraham to count?", choices: ["The stars", "His sheep", "The trees"], answer: 0 },
    challenge: "Tonight, look up at the stars (or the sky) and remember that God keeps His promises."
  },
  {
    id: "joseph", emoji: "🧥", title: "Joseph and His Colourful Coat", ref: "Genesis 37–45",
    story: [
      "Jacob had twelve sons, and he loved Joseph very much. He gave Joseph a special, beautiful coat. Joseph also had dreams that one day his family would bow down to him. His older brothers became jealous and angry.",
      "One day, when the brothers were looking after sheep far from home, they saw Joseph coming. They took his coat, threw him into an empty well, and then sold him to traders going to Egypt. They told their father that a wild animal had killed him.",
      "In Egypt, Joseph became a servant, and later he was put in prison even though he had done nothing wrong. But the Bible says, \"The Lord was with Joseph.\" Joseph kept trusting God and kept doing what was right.",
      "One night Pharaoh, the king of Egypt, had strange dreams that nobody could explain. God helped Joseph understand them: there would be seven years of plenty of food, then seven years with almost none. Pharaoh put Joseph in charge of storing grain for all of Egypt.",
      "When the hungry years came, Joseph's brothers travelled to Egypt to buy food. They bowed down before him, but they did not recognise him! After testing them, Joseph told them, \"I am Joseph, your brother!\"",
      "The brothers were afraid, but Joseph forgave them and hugged them. He said, \"Don't be upset with yourselves. God sent me ahead of you to save lives.\" Joseph brought his whole family, even his old father Jacob, to live safely in Egypt. Years later he told his brothers, \"You meant to hurt me, but God meant it for good.\""
    ],
    fact: "Joseph was 17 when his brothers sold him, and about 30 when he became a ruler in Egypt.",
    question: { q: "What did Joseph do when he met his brothers again?", choices: ["He punished them", "He forgave them", "He ran away"], answer: 1 },
    challenge: "Is someone hard to forgive? Ask God to help you forgive them, like Joseph did."
  },
  {
    id: "baby-moses", emoji: "🧺", title: "Baby Moses in a Basket", ref: "Exodus 1–2",
    story: [
      "God's people, the Israelites, were living in Egypt. A new Pharaoh was afraid because there were so many of them, so he made them work as slaves. Then he gave a terrible order: every baby boy born to the Israelites must be thrown into the Nile River.",
      "One Israelite mother had a beautiful baby boy. She hid him for three months. When she could not hide him any longer, she made a basket from reeds, covered it with tar so it would float, and gently placed her baby inside.",
      "She set the basket among the tall reeds at the edge of the river. The baby's big sister, Miriam, stood nearby to watch what would happen.",
      "Soon Pharaoh's daughter came down to the river to bathe. She saw the basket and sent her servant to fetch it. When she opened it, the baby was crying, and she felt sorry for him. \"This is one of the Hebrew babies,\" she said.",
      "Brave Miriam stepped forward and asked, \"Shall I find a Hebrew woman to feed the baby for you?\" The princess said yes, and Miriam ran to get… the baby's own mother! She was even paid to take care of her son.",
      "When the boy grew older, he went to live in the palace as the princess's son. She named him Moses. God was keeping Moses safe, because one day He would use Moses to lead His people out of Egypt."
    ],
    fact: "The name Moses sounds like the Hebrew word for \"drawn out,\" because he was drawn out of the water.",
    question: { q: "Who watched over baby Moses by the river?", choices: ["His brother Aaron", "His sister Miriam", "A soldier"], answer: 1 },
    challenge: "Look out for a younger child or a friend today, just like Miriam looked out for Moses."
  },
  {
    id: "burning-bush", emoji: "🔥", title: "Moses and the Burning Bush", ref: "Exodus 3–4",
    story: [
      "When Moses grew up, he had to run away from Egypt. He went to the land of Midian, got married and became a shepherd. For many years he looked after sheep in the desert.",
      "One day Moses led the sheep near Mount Horeb, the mountain of God. There he saw something amazing: a bush was on fire, but it was not burning up! \"I must go and see this strange sight,\" Moses said.",
      "As he came closer, God called to him from the bush: \"Moses! Moses!\" \"Here I am,\" Moses answered. God said, \"Take off your sandals, for the place where you are standing is holy ground.\"",
      "God told Moses, \"I have seen how My people are suffering in Egypt, and I have heard their cries. I am sending you to Pharaoh to bring My people out.\" Moses was scared. \"Who am I to go to Pharaoh?\" he asked. God answered, \"I will be with you.\"",
      "Moses asked what God's name was. God said, \"I AM WHO I AM.\" Moses was still worried that no one would listen to him, and that he was not good at speaking. God gave him special signs to show and sent his brother Aaron to help him speak.",
      "So Moses obeyed. He took his family and his shepherd's staff and set off back to Egypt, trusting that God would be with him every step of the way."
    ],
    fact: "God turned Moses' shepherd staff into a snake and back again, as a sign to show God had sent him.",
    question: { q: "What was strange about the burning bush?", choices: ["It was blue", "It did not burn up", "It was singing"], answer: 1 },
    challenge: "When something feels too hard today, remember God's words: \"I will be with you.\""
  },
  {
    id: "red-sea", emoji: "🌊", title: "Crossing the Red Sea", ref: "Exodus 14",
    story: [
      "After God sent ten plagues on Egypt, Pharaoh finally let the Israelites go. Moses led the huge crowd out of Egypt. God guided them with a tall pillar of cloud during the day and a pillar of fire at night.",
      "But soon Pharaoh changed his mind. \"What have we done? We have let our slaves go!\" He got his chariots and his army and chased after them.",
      "The Israelites were camped by the Red Sea. When they saw the Egyptian army coming, they were terrified. The sea was in front of them and the army was behind them! They cried out to Moses.",
      "Moses said, \"Don't be afraid. Stand still and see how the Lord will save you today. The Lord will fight for you.\" The pillar of cloud moved behind the people, between them and the Egyptians, so the army could not reach them.",
      "Then God told Moses to stretch out his hand over the sea. All night a strong east wind blew, and the water split apart, with walls of water on the right and on the left! The Israelites walked through the middle of the sea on dry ground.",
      "When the Egyptians followed them, the water came back and covered the chariots. God's people were safe on the other side. Moses and Miriam led everyone in singing and dancing to praise God for His mighty rescue."
    ],
    fact: "The Israelites crossed on dry ground, not mud, even though they were walking through the middle of the sea!",
    question: { q: "What did God use to push back the water?", choices: ["A strong wind", "A big boat", "A giant bucket"], answer: 0 },
    challenge: "Sing a song of praise to God today, like Moses and Miriam did."
  },
  {
    id: "jericho", emoji: "🎺", title: "The Walls of Jericho", ref: "Joshua 6",
    story: [
      "After Moses died, Joshua became the leader of God's people. They had finally reached the land God had promised them. But in front of them stood the city of Jericho, with big, strong walls and its gates shut tight.",
      "God gave Joshua a very unusual plan. \"March around the city once each day for six days. Seven priests will carry trumpets made from rams' horns in front of the ark of the covenant. On the seventh day, march around the city seven times.\"",
      "Joshua told the people, \"Do not shout or say a word until the day I tell you to shout.\" So every day, the soldiers, the priests with trumpets and the ark marched quietly around Jericho, then went back to camp.",
      "The people inside Jericho must have wondered what was happening! The Israelites did not use ladders or battering rams. They simply obeyed God, even though His plan seemed strange.",
      "On the seventh day they got up at dawn and marched around the city seven times. On the seventh time, the priests blew the trumpets, and Joshua shouted, \"Shout! For the Lord has given you the city!\"",
      "The people gave a loud shout, and the great walls of Jericho fell down flat! The Israelites went straight into the city. God had won the battle, because His people trusted Him and did exactly what He said."
    ],
    fact: "The Israelites marched around Jericho 13 times altogether: once a day for six days, then seven times on day seven.",
    question: { q: "How many times did they march around Jericho on the seventh day?", choices: ["Three times", "Seven times", "Ten times"], answer: 1 },
    challenge: "Obey the first time you are asked today, even if you don't understand why."
  },
  {
    id: "ruth", emoji: "🌾", title: "Ruth's Kind Heart", ref: "Ruth 1–4",
    story: [
      "During a time of famine, a woman named Naomi moved with her husband and two sons to the land of Moab. Her sons married Moabite women named Orpah and Ruth. Then sadly, Naomi's husband and both sons died.",
      "Naomi decided to go home to Bethlehem. She told her daughters-in-law to stay in Moab with their own families. Orpah kissed her goodbye, but Ruth held on to her.",
      "Ruth said, \"Don't ask me to leave you! Where you go, I will go. Where you stay, I will stay. Your people will be my people, and your God will be my God.\" So Ruth went with Naomi to Bethlehem.",
      "They were very poor. It was harvest time, so Ruth went to the fields to pick up the leftover grain behind the workers. She worked hard all day to get food for Naomi. The field belonged to a kind man named Boaz.",
      "Boaz had heard how loyal and kind Ruth had been to Naomi. He told his workers to leave extra grain for her on purpose, and he made sure she was safe. \"May the Lord reward you for what you have done,\" he said.",
      "Later Boaz married Ruth, and they had a baby boy named Obed. Naomi was full of joy again! Obed became the grandfather of King David, and from David's family, Jesus was born."
    ],
    fact: "Ruth, a woman from Moab, became the great-grandmother of King David.",
    question: { q: "What did Ruth pick up in Boaz's field?", choices: ["Leftover grain", "Pretty stones", "Apples"], answer: 0 },
    challenge: "Help someone in your family today without being asked, like Ruth helped Naomi."
  },
  {
    id: "samuel", emoji: "🕯️", title: "God Calls Young Samuel", ref: "1 Samuel 3",
    story: [
      "Hannah had prayed for a long time for a baby. When God gave her a son, she named him Samuel, and she kept her promise to give him to serve the Lord. Young Samuel lived at the house of God with Eli, the old priest.",
      "In those days, people did not often hear messages from God. One night, Eli was asleep in his room, and Samuel was lying down near the place where the ark of God was kept. The lamp of God was still burning.",
      "Then the Lord called, \"Samuel!\" Samuel jumped up and ran to Eli. \"Here I am; you called me.\" But Eli said, \"I did not call you. Go back and lie down.\"",
      "It happened again, and then a third time. Each time Samuel ran to Eli. Samuel did not yet know the Lord's voice. Finally Eli understood that God was calling the boy.",
      "Eli told Samuel, \"If He calls you again, say, 'Speak, Lord, for Your servant is listening.'\" So Samuel went and lay down. The Lord came and called as before, \"Samuel! Samuel!\" And Samuel answered, \"Speak, for Your servant is listening.\"",
      "God gave Samuel an important message that night. As Samuel grew up, the Lord was with him, and everyone in Israel knew that Samuel was a true prophet of God. God loves to speak to children who are ready to listen!"
    ],
    fact: "God called Samuel four times that night before Samuel answered Him.",
    question: { q: "What did Samuel say to God?", choices: ["\"I'm too tired\"", "\"Speak, for Your servant is listening\"", "\"Call me tomorrow\""], answer: 1 },
    challenge: "Find a quiet moment today. Pray, \"Speak, Lord, I'm listening,\" and read a Bible verse."
  },
  {
    id: "david-goliath", emoji: "🪨", title: "David and Goliath", ref: "1 Samuel 17",
    story: [
      "The army of Israel and the army of the Philistines were camped on two hills, with a valley between them. Every morning and evening, a giant Philistine named Goliath stepped out. He was about three metres tall, wearing heavy armour and carrying a huge spear.",
      "\"Send someone to fight me!\" Goliath shouted. \"If he wins, we will be your servants!\" King Saul and all the soldiers of Israel were terribly afraid. For forty days, nobody dared to go out.",
      "A young shepherd boy named David came to bring food to his older brothers in the army. When he heard Goliath making fun of the army of the living God, David said, \"I will go and fight him!\"",
      "King Saul said, \"You are only a boy.\" But David answered, \"I have killed a lion and a bear while protecting my sheep. The Lord who saved me from the lion and the bear will save me from this Philistine.\"",
      "Saul tried to give David his own armour, but it was too big and heavy. So David took his shepherd's staff, chose five smooth stones from a stream, and walked out with his sling.",
      "Goliath laughed at him. David said, \"You come against me with a sword and spear, but I come against you in the name of the Lord!\" David ran forward, put a stone in his sling and swung it. The stone hit Goliath on the forehead, and the giant fell to the ground. God had given the victory!"
    ],
    fact: "David picked up five smooth stones, but he only needed one!",
    question: { q: "What did David use to fight Goliath?", choices: ["A sword", "A sling and a stone", "A bow and arrow"], answer: 1 },
    challenge: "What is a \"giant\" worry in your life? Talk to God about it and trust Him, like David did."
  },
  {
    id: "elijah", emoji: "🔥", title: "Elijah and the Fire from Heaven", ref: "1 Kings 18",
    story: [
      "King Ahab of Israel had turned away from God. He and many people were worshipping a false god called Baal. So God's prophet Elijah gave the people a challenge on Mount Carmel.",
      "Elijah said, \"How long will you keep changing your minds? If the Lord is God, follow Him! But if Baal is god, follow him.\" The people said nothing.",
      "Elijah explained the test. The 450 prophets of Baal would prepare a sacrifice on an altar and call to their god. Elijah would do the same and call to the Lord. \"The God who answers by fire, He is God!\"",
      "The prophets of Baal went first. They shouted from morning until noon, \"Baal, answer us!\" They danced around their altar for hours. But there was no answer. Nobody was listening, because Baal was not real.",
      "Then Elijah rebuilt the Lord's altar with twelve stones and dug a trench around it. He even had the people pour water all over the sacrifice three times, until the water filled the trench!",
      "Elijah prayed a simple prayer: \"Lord, let it be known today that You are God in Israel.\" Then fire from the Lord fell from heaven and burned up the sacrifice, the wood, the stones and even the water! The people fell on their faces and cried, \"The Lord, He is God!\""
    ],
    fact: "Elijah had 12 big jars of water poured over the altar, to show that only God could set it on fire.",
    question: { q: "How did God answer Elijah's prayer?", choices: ["With rain", "With fire from heaven", "With thunder only"], answer: 1 },
    challenge: "Say a short, simple prayer today, like Elijah did. God hears every prayer."
  },
  {
    id: "esther", emoji: "👑", title: "Brave Queen Esther", ref: "Esther 2–8",
    story: [
      "Esther was a young Jewish woman living in the land of Persia. Her parents had died, so her cousin Mordecai raised her as his own daughter. When King Xerxes looked for a new queen, he chose Esther, but she did not tell anyone she was Jewish.",
      "The king's most important official was a proud man named Haman. Everyone was supposed to bow to him, but Mordecai would bow only to God. Haman became so angry that he tricked the king into making a law to destroy all the Jewish people.",
      "Mordecai sent a message to Esther: \"You must go to the king and beg him to save your people. Who knows? Maybe you became queen for such a time as this.\"",
      "But there was a problem. Anyone who went to see the king without being invited could be put to death, unless the king held out his golden sceptre. Esther asked all the Jews to fast and pray for her for three days.",
      "Then Esther said, \"I will go to the king, even though it is against the law. If I die, I die.\" She put on her royal robes and stood in the king's courtyard. When the king saw her, he was pleased and held out his golden sceptre!",
      "At a special dinner, Esther bravely told the king about Haman's evil plan. The king was furious with Haman, and he gave the Jewish people the right to defend themselves. God used brave Esther to save His people. Jewish families still celebrate it today at the festival of Purim."
    ],
    fact: "God's name is never written in the book of Esther, but we can see Him working behind everything that happens.",
    question: { q: "What did the king hold out to show Esther was welcome?", choices: ["A golden sceptre", "A crown", "A sword"], answer: 0 },
    challenge: "Be brave and speak up kindly for someone who is being treated unfairly."
  },
  {
    id: "fiery-furnace", emoji: "🔥", title: "Three Friends in the Fiery Furnace", ref: "Daniel 3",
    story: [
      "King Nebuchadnezzar of Babylon built a giant golden statue, about thirty metres tall. He gave an order: \"When you hear the music play, everyone must bow down and worship the golden statue. Anyone who does not will be thrown into a blazing furnace!\"",
      "When the music played, crowds of people bowed down. But three young Jewish men, Shadrach, Meshach and Abednego, stood tall. They would worship only the one true God.",
      "The king was furious. He gave them one more chance. But they answered, \"Our God is able to save us from the furnace. But even if He does not, we will never worship your golden statue.\"",
      "Nebuchadnezzar was so angry that he ordered the furnace to be heated seven times hotter than usual. The three friends were tied up and thrown into the fire. It was so hot that the soldiers who threw them in were killed by the flames.",
      "Then the king jumped up in amazement. \"Didn't we throw three men into the fire? Look! I see four men walking around in the fire, unharmed, and the fourth looks like a son of the gods!\" God had sent His angel to be with them.",
      "The king called them to come out. Their hair was not burned, their clothes were not scorched, and they did not even smell of smoke! The king praised their God and said, \"No other god can save like this.\""
    ],
    fact: "The three friends were thrown into the fire tied up, but the king saw them walking around free in the flames!",
    question: { q: "How many men did the king see walking in the fire?", choices: ["Three", "Four", "Two"], answer: 1 },
    challenge: "Do what is right today, even if everyone around you is doing something else."
  },
  {
    id: "daniel-lions", emoji: "🦁", title: "Daniel in the Lions' Den", ref: "Daniel 6",
    story: [
      "Daniel was a wise and honest man who served King Darius of Persia. Daniel did his work so well that the king planned to put him in charge of the whole kingdom. This made the other leaders jealous.",
      "They tried to find something wrong with Daniel, but they could not. He was always honest and faithful. So they said, \"The only way to trap him will be with the law of his God.\"",
      "The leaders went to the king and said, \"O King, make a new law: for thirty days, anyone who prays to any god or person except you will be thrown into the lions' den.\" The king liked the idea and signed the law. It could not be changed.",
      "Daniel heard about the law, but he went home to his room, opened his windows toward Jerusalem, and knelt down to pray and give thanks to God, three times a day, just as he always did.",
      "The jealous men saw him praying and told the king. Darius was very upset, because he liked Daniel, but he had to keep his own law. Daniel was thrown into the den of hungry lions, and a stone was rolled over the opening. The king said, \"May your God, whom you serve faithfully, rescue you!\"",
      "The king could not sleep all night. At dawn he hurried to the den and called out, \"Daniel, has your God been able to save you?\" Daniel answered, \"My God sent His angel and shut the lions' mouths!\" Daniel came out without a scratch, because he had trusted in his God."
    ],
    fact: "Daniel prayed three times a day, every day, and he did not stop even when it became dangerous.",
    question: { q: "Who shut the lions' mouths?", choices: ["The king", "God's angel", "Daniel's friends"], answer: 1 },
    challenge: "Pray three times today: in the morning, at lunchtime and before bed, like Daniel."
  },
  {
    id: "jonah", emoji: "🐋", title: "Jonah and the Big Fish", ref: "Jonah 1–3",
    story: [
      "God spoke to a prophet named Jonah: \"Go to the great city of Nineveh and tell the people to stop their wicked ways.\" But Jonah did not want to go. The people of Nineveh were enemies of Israel.",
      "So Jonah ran the other way! He went down to the port of Joppa and got on a ship sailing to Tarshish, as far away as he could go. Then he went down into the ship and fell fast asleep.",
      "God sent a great wind, and a huge storm crashed against the ship. The sailors were terrified. When they found out Jonah was running away from God, Jonah said, \"Throw me into the sea, and it will become calm.\" At last they did, and the sea became calm.",
      "But God had a plan to save Jonah. He sent a huge fish to swallow him! Jonah was inside the fish for three days and three nights. There, in the dark, Jonah prayed and thanked God for saving him.",
      "Then God commanded the fish, and it spat Jonah out onto dry land. God spoke to Jonah a second time: \"Go to Nineveh.\" This time Jonah obeyed!",
      "Jonah walked through the great city and warned the people. Everyone, from the king to the poorest person, stopped doing evil and prayed to God. God saw that they had changed, and He showed them mercy. God loves all people and gives second chances."
    ],
    fact: "The Bible says a \"great fish\". It doesn't say whale, but it was big enough to swallow Jonah whole!",
    question: { q: "How long was Jonah inside the fish?", choices: ["One hour", "Three days and three nights", "Forty days"], answer: 1 },
    challenge: "Is there something God (or a parent) asked you to do that you've been avoiding? Do it today!"
  },
  {
    id: "jesus-born", emoji: "⭐", title: "Jesus Is Born", ref: "Luke 1–2",
    story: [
      "God sent the angel Gabriel to a young woman named Mary in the town of Nazareth. \"Don't be afraid, Mary,\" the angel said. \"You will have a baby boy, and you will name Him Jesus. He will be called the Son of the Most High God.\" Mary said, \"I am the Lord's servant.\"",
      "Mary was engaged to a carpenter named Joseph. The Roman emperor ordered everyone to go to their family's hometown to be counted. So Joseph and Mary travelled all the way to Bethlehem, the town of King David.",
      "When they arrived, the town was very busy, and there was no room for them in the inn. While they were there, the time came for the baby to be born. Mary wrapped baby Jesus in cloths and laid Him in a manger, a feeding box for animals.",
      "That night, shepherds were watching their sheep in the fields nearby. Suddenly an angel appeared, and God's glory shone all around them. They were terrified! The angel said, \"Don't be afraid! I bring you good news of great joy for all the people. Today in the town of David a Saviour has been born. He is Christ the Lord!\"",
      "Then a huge crowd of angels appeared, praising God: \"Glory to God in the highest, and on earth peace!\" The shepherds hurried to Bethlehem and found Mary, Joseph and the baby lying in the manger, just as the angel had said.",
      "The shepherds told everyone what the angel had said about this child, and all who heard it were amazed. Mary treasured all these things in her heart. The shepherds went back praising God. The Saviour of the world had come!"
    ],
    fact: "The name Jesus means \"The Lord saves.\"",
    question: { q: "Where did Mary lay baby Jesus?", choices: ["In a palace bed", "In a manger", "In a boat"], answer: 1 },
    challenge: "Share the good news! Tell someone today that Jesus came because God loves us."
  },
  {
    id: "wise-men", emoji: "🌟", title: "The Wise Men Follow the Star", ref: "Matthew 2",
    story: [
      "After Jesus was born in Bethlehem, wise men from the east arrived in Jerusalem. They had studied the stars, and they had seen a special star rising. \"Where is the one who has been born King of the Jews?\" they asked. \"We have come to worship Him.\"",
      "When wicked King Herod heard this, he was worried. He did not want any other king! He asked the priests and teachers where the Christ would be born. They answered, \"In Bethlehem, for that is what the prophet wrote.\"",
      "Herod secretly called the wise men and said, \"Go and search carefully for the child. When you find Him, tell me, so that I can go and worship Him too.\" But Herod was not telling the truth.",
      "The wise men set off, and the star went ahead of them until it stopped over the place where the child was. When they saw the star, they were filled with great joy!",
      "They went into the house and saw Jesus with His mother Mary. They bowed down and worshipped Him. Then they opened their treasures and gave Him gifts of gold, frankincense and myrrh.",
      "God warned the wise men in a dream not to go back to Herod, so they went home another way. An angel also warned Joseph to take Mary and Jesus to Egypt, where they stayed safe until Herod died."
    ],
    fact: "The Bible doesn't say there were three wise men. We only know they brought three kinds of gifts.",
    question: { q: "What led the wise men to Jesus?", choices: ["A star", "A map", "A dove"], answer: 0 },
    challenge: "The wise men gave Jesus their best. What can you give Jesus today: your time, your kindness, your song?"
  },
  {
    id: "boy-jesus", emoji: "📜", title: "Jesus as a Boy in the Temple", ref: "Luke 2:41–52",
    story: [
      "Every year Mary and Joseph travelled to Jerusalem for the Passover festival. When Jesus was twelve years old, He went with them, as was the custom. The roads were full of families and friends travelling together.",
      "When the festival was over, Mary and Joseph started for home. They thought Jesus was somewhere in their big group of relatives and friends. But after a whole day of walking, they could not find Him anywhere!",
      "Worried, Mary and Joseph hurried back to Jerusalem. They searched for three days. At last they found Him in the temple courts, sitting among the teachers of God's law, listening to them and asking questions.",
      "Everyone who heard Jesus was amazed at how much He understood and at His answers. Mary said to Him, \"Son, why have You done this? Your father and I have been looking for You everywhere!\"",
      "Jesus answered, \"Why were you searching for Me? Didn't you know I had to be in My Father's house?\" Jesus knew that God was His true Father, even as a boy.",
      "Then Jesus went home to Nazareth with Mary and Joseph and obeyed them. Mary treasured all these things in her heart. And Jesus grew in wisdom and in size, and in favour with God and with people."
    ],
    fact: "This is the only story in the Bible about Jesus as a boy between His birth and when He grew up.",
    question: { q: "How old was Jesus when He stayed in the temple?", choices: ["Five", "Twelve", "Twenty"], answer: 1 },
    challenge: "Ask a grown-up a question about God or the Bible today, like Jesus asked questions in the temple."
  },
  {
    id: "fishermen", emoji: "🎣", title: "Jesus Calls the Fishermen", ref: "Luke 5:1–11",
    story: [
      "One day Jesus was standing by the Sea of Galilee, and a big crowd was pressing around Him to hear God's word. Jesus saw two fishing boats at the water's edge. The fishermen were washing their nets.",
      "Jesus got into the boat that belonged to Simon Peter and asked him to push out a little from the shore. Then Jesus sat down and taught the people from the boat.",
      "When He finished speaking, Jesus said to Simon, \"Go out into the deep water, and let down your nets for a catch.\" Simon answered, \"Master, we worked hard all night and caught nothing. But because You say so, I will let down the nets.\"",
      "When they did, they caught so many fish that their nets began to break! They called to their partners, James and John, in the other boat to come and help. Both boats were so full of fish that they began to sink!",
      "When Simon Peter saw this, he fell at Jesus' knees and said, \"Go away from me, Lord, for I am a sinful man!\" He and his friends were amazed. Jesus said to Simon, \"Don't be afraid. From now on you will fish for people.\"",
      "So Peter, James and John pulled their boats up on shore, left everything and followed Jesus. They became His disciples and learned from Him every day."
    ],
    fact: "Peter, James and John became three of Jesus' closest friends among the twelve disciples.",
    question: { q: "What happened when the fishermen obeyed Jesus?", choices: ["They caught nothing", "Their nets were so full they began to break", "Their boat floated away"], answer: 1 },
    challenge: "Follow Jesus today by doing one thing He teaches: be kind, share, or forgive."
  },
  {
    id: "water-wine", emoji: "🍷", title: "Jesus Turns Water into Wine", ref: "John 2:1–11",
    story: [
      "There was a wedding in the town of Cana in Galilee. Jesus' mother Mary was there, and Jesus and His disciples had also been invited. Weddings were big celebrations that could last for days.",
      "During the party, something embarrassing happened: the wine ran out! Mary came to Jesus and told Him, \"They have no more wine.\" Then she said to the servants, \"Do whatever He tells you.\"",
      "Nearby stood six large stone water jars, the kind used for washing. Each one could hold about one hundred litres. Jesus told the servants, \"Fill the jars with water.\" So they filled them right up to the brim.",
      "Then Jesus said, \"Now draw some out and take it to the person in charge of the feast.\" The servants obeyed. When the man in charge tasted it, the water had become wine! He did not know where it had come from, but the servants knew.",
      "The man called the bridegroom and said, \"Everyone serves the best wine first, but you have saved the best until now!\"",
      "This was the first of Jesus' miraculous signs. Through it He showed His glory, and His disciples believed in Him. Jesus cares about ordinary people and their everyday troubles."
    ],
    fact: "The six stone jars together held about 600 litres. That's a lot of wine for a wedding!",
    question: { q: "What did Mary tell the servants?", choices: ["\"Go home\"", "\"Do whatever He tells you\"", "\"Buy more wine\""], answer: 1 },
    challenge: "Do whatever Jesus tells you! Read one thing He said (try Luke 6:31) and do it today."
  },
  {
    id: "calms-storm", emoji: "⛵", title: "Jesus Calms the Storm", ref: "Mark 4:35–41",
    story: [
      "Jesus had been teaching crowds of people by the Sea of Galilee all day long. When evening came, He said to His disciples, \"Let's go over to the other side of the lake.\"",
      "They left the crowd and set off in the boat with Jesus. Jesus was very tired, so He went to the back of the boat, lay down on a cushion and fell asleep.",
      "Suddenly a furious storm came up. The wind howled, and huge waves crashed over the sides of the boat, so that it was nearly filling with water. Even the disciples who were fishermen were terrified!",
      "But Jesus was still asleep. The disciples woke Him up and shouted, \"Teacher, don't You care that we are about to drown?\"",
      "Jesus got up. He spoke to the wind and said to the waves, \"Quiet! Be still!\" Right away the wind stopped, and everything became completely calm.",
      "Jesus turned to His disciples and asked, \"Why are you so afraid? Do you still have no faith?\" The disciples were amazed and asked each other, \"Who is this? Even the wind and the waves obey Him!\" Jesus is with us in every storm, and nothing is too big for Him."
    ],
    fact: "The Sea of Galilee sits low between hills, so sudden strong winds can rush down and stir up big storms.",
    question: { q: "What was Jesus doing when the storm started?", choices: ["Fishing", "Sleeping", "Rowing"], answer: 1 },
    challenge: "When you feel scared today, say, \"Jesus, You are with me,\" and take a deep breath."
  },
  {
    id: "feeds-5000", emoji: "🍞", title: "Jesus Feeds 5,000 People", ref: "John 6:1–14",
    story: [
      "A huge crowd followed Jesus to a hillside near the Sea of Galilee, because they had seen Him heal sick people. Jesus sat down with His disciples and looked at all the people coming toward Him.",
      "Jesus asked Philip, \"Where can we buy bread for these people to eat?\" Jesus already knew what He was going to do; He was testing Philip. Philip said, \"Even eight months' wages would not buy enough bread for each person to have a bite!\"",
      "Then Andrew said, \"Here is a boy with five small barley loaves and two small fish. But how far will they go among so many?\"",
      "Jesus said, \"Have the people sit down.\" There was plenty of grass there, and about five thousand men sat down, plus women and children. Jesus took the loaves, gave thanks to God and handed them out to the people. He did the same with the fish.",
      "Everyone ate as much as they wanted! When they had all had enough, Jesus told His disciples, \"Gather the pieces that are left over. Let nothing be wasted.\"",
      "They filled twelve baskets with the leftover pieces from the five barley loaves. When the people saw this sign, they said, \"Surely this is the Prophet who was to come into the world!\" A boy shared a small lunch, and Jesus used it to feed thousands."
    ],
    fact: "This is the only miracle (apart from the resurrection) that is written about in all four Gospels.",
    question: { q: "How many baskets of leftovers were there?", choices: ["Two", "Five", "Twelve"], answer: 2 },
    challenge: "Share something today, like the boy who shared his lunch. Small gifts can do big things with Jesus!"
  },
  {
    id: "walks-water", emoji: "🌊", title: "Jesus Walks on the Water", ref: "Matthew 14:22–33",
    story: [
      "After feeding the five thousand, Jesus told His disciples to get into the boat and go ahead of Him to the other side of the lake. Then He went up on a mountain by Himself to pray.",
      "By night, the boat was far from land, being battered by the waves, because the wind was against it. Very early in the morning, Jesus came toward them, walking on the water!",
      "When the disciples saw Him, they were terrified. \"It's a ghost!\" they cried out in fear. But Jesus spoke to them right away: \"Take courage! It is I. Don't be afraid.\"",
      "Peter said, \"Lord, if it's You, tell me to come to You on the water.\" Jesus said, \"Come.\" So Peter got out of the boat, walked on the water and came toward Jesus!",
      "But when Peter looked at the strong wind, he became afraid and began to sink. \"Lord, save me!\" he cried. Immediately Jesus reached out His hand and caught him. \"You of little faith,\" He said, \"why did you doubt?\"",
      "When they climbed into the boat, the wind stopped. The disciples worshipped Jesus and said, \"Truly You are the Son of God!\" When we keep our eyes on Jesus, He helps us, and when we start to sink, He reaches out to save us."
    ],
    fact: "Peter is the only person in the Bible, besides Jesus, who walked on water.",
    question: { q: "Why did Peter begin to sink?", choices: ["He was too heavy", "He looked at the wind and became afraid", "Jesus let go"], answer: 1 },
    challenge: "Keep your eyes on Jesus today: when you feel worried, say a quick prayer, \"Lord, help me!\""
  },
  {
    id: "good-samaritan", emoji: "🤝", title: "The Good Samaritan", ref: "Luke 10:25–37",
    story: [
      "A teacher of God's law asked Jesus, \"What must I do to have eternal life?\" Jesus asked him what the law said. The man answered, \"Love the Lord your God with all your heart, and love your neighbour as yourself.\" \"That's right,\" said Jesus. Then the man asked, \"But who is my neighbour?\"",
      "Jesus answered with a story. A man was travelling down the road from Jerusalem to Jericho. Robbers attacked him, took his clothes, beat him and left him lying by the road, half dead.",
      "A priest happened to be going down the same road. When he saw the hurt man, he passed by on the other side. Then a Levite, a helper at the temple, came along. He looked at the man, but he also passed by on the other side.",
      "Then a Samaritan came along. Jews and Samaritans did not get along at all. But when the Samaritan saw the man, he felt sorry for him. He bandaged his wounds, pouring on oil and wine to clean them.",
      "He put the man on his own donkey, took him to an inn and cared for him all night. The next day he gave the innkeeper two silver coins and said, \"Look after him. If you spend more, I will pay you back when I return.\"",
      "Jesus asked, \"Which of these three was a neighbour to the man who was hurt?\" The teacher answered, \"The one who showed him mercy.\" Jesus said, \"Go and do the same.\" Our neighbour is anyone who needs our help."
    ],
    fact: "Jews and Samaritans usually avoided each other, which is why it was so surprising that the Samaritan was the hero.",
    question: { q: "Who stopped to help the hurt man?", choices: ["The priest", "The Levite", "The Samaritan"], answer: 2 },
    challenge: "Be a good neighbour: help someone today, even someone who isn't your friend yet."
  },
  {
    id: "lost-sheep", emoji: "🐑", title: "The Lost Sheep", ref: "Luke 15:1–7",
    story: [
      "Many people who had done wrong things were coming to listen to Jesus. Some religious leaders grumbled, \"This man welcomes sinners and even eats with them!\" So Jesus told them a story.",
      "\"Imagine you have one hundred sheep,\" Jesus said. \"You look after them every day, you count them and keep them safe. But one day you count again… and one sheep is missing!\"",
      "\"Wouldn't you leave the ninety-nine sheep in the open country and go looking for the one that is lost until you find it?\" The good shepherd does not say, \"Oh well, I still have ninety-nine.\" Every single sheep matters to him.",
      "The shepherd searches over hills and through valleys. And when he finds the lost sheep, he is not angry. Instead, he joyfully puts it on his shoulders and carries it all the way home.",
      "When he gets home, he calls his friends and neighbours together and says, \"Celebrate with me! I have found my lost sheep!\"",
      "Then Jesus explained, \"In the same way, there will be more joy in heaven over one sinner who turns back to God than over ninety-nine people who think they don't need to.\" Jesus is our Good Shepherd. He never stops looking for us, and every person matters to Him."
    ],
    fact: "Jesus called Himself \"the Good Shepherd\" who lays down His life for the sheep (John 10:11).",
    question: { q: "How many sheep did the shepherd have at the start?", choices: ["Ten", "Fifty", "One hundred"], answer: 2 },
    challenge: "Notice someone who is left out today and invite them to join you."
  },
  {
    id: "children", emoji: "🧒", title: "Jesus Blesses the Children", ref: "Mark 10:13–16",
    story: [
      "Everywhere Jesus went, crowds of people came to see Him. Some came to be healed, some came to ask questions, and some came just to listen to His teaching.",
      "One day, some parents brought their little children to Jesus. They wanted Jesus to put His hands on them and bless them. Maybe the children were excited and a bit noisy as they pushed forward to see Him.",
      "But the disciples stopped them. They told the parents off. Perhaps they thought Jesus was too busy and too important to spend time with children.",
      "When Jesus saw this, He was not pleased with His disciples at all! He said, \"Let the little children come to Me, and don't stop them, for the kingdom of God belongs to people like these.\"",
      "Then Jesus said something very important: \"Truly I tell you, anyone who will not receive the kingdom of God like a little child will never enter it.\" Children trust and love with their whole hearts, and that is how Jesus wants everyone to come to Him.",
      "Jesus took the children in His arms, put His hands on them and blessed them. Jesus is never too busy for children. He loves you, and you can come to Him any time!"
    ],
    fact: "Jesus said grown-ups need to receive God's kingdom like a little child, trusting God completely.",
    question: { q: "What did Jesus do with the children?", choices: ["Sent them away", "Took them in His arms and blessed them", "Gave them homework"], answer: 1 },
    challenge: "Talk to Jesus today like you'd talk to your best friend. He's never too busy for you!"
  },
  {
    id: "zacchaeus", emoji: "🌳", title: "Zacchaeus Climbs a Tree", ref: "Luke 19:1–10",
    story: [
      "Jesus was passing through the city of Jericho. A man named Zacchaeus lived there. He was a chief tax collector and very rich, but people did not like him, because tax collectors often cheated people by taking extra money.",
      "Zacchaeus wanted to see who Jesus was. But there was a big crowd, and Zacchaeus was a short man. He could not see over all the people!",
      "So he ran ahead and climbed up a sycamore-fig tree, because Jesus was coming that way. There he sat in the branches, waiting.",
      "When Jesus reached that spot, He stopped, looked up and said, \"Zacchaeus, come down quickly! I must stay at your house today.\" Zacchaeus hurried down and welcomed Jesus with joy.",
      "The people in the crowd grumbled, \"He has gone to be the guest of a sinner!\" But Jesus' kindness changed Zacchaeus' heart. He stood up and said, \"Lord, I will give half of everything I own to the poor. And if I have cheated anyone, I will pay back four times as much!\"",
      "Jesus said, \"Today salvation has come to this house. For the Son of Man came to seek and to save the lost.\" Jesus loved Zacchaeus when nobody else did, and that love made him a new person."
    ],
    fact: "Zacchaeus promised to pay back four times as much as he had taken from anyone he cheated.",
    question: { q: "Why did Zacchaeus climb the tree?", choices: ["To pick fruit", "Because he was short and wanted to see Jesus", "To hide from Jesus"], answer: 1 },
    challenge: "Make something right today: say sorry or give back something that isn't yours."
  },
  {
    id: "bartimaeus", emoji: "👀", title: "Blind Bartimaeus Sees", ref: "Mark 10:46–52",
    story: [
      "As Jesus and His disciples were leaving the city of Jericho, a large crowd was walking with them. Sitting by the side of the road was a blind man named Bartimaeus. Because he could not see, he had to beg for money.",
      "When Bartimaeus heard that Jesus of Nazareth was passing by, he began to shout, \"Jesus, Son of David, have mercy on me!\"",
      "Many people in the crowd told him off and told him to be quiet. But Bartimaeus did not give up. He shouted even louder, \"Son of David, have mercy on me!\"",
      "Jesus stopped. He said, \"Call him.\" So the people called to the blind man, \"Cheer up! Get up! He's calling you!\" Bartimaeus threw off his cloak, jumped to his feet and came to Jesus.",
      "Jesus asked him, \"What do you want Me to do for you?\" Bartimaeus said, \"Teacher, I want to see.\" Jesus said, \"Go, your faith has healed you.\"",
      "Immediately Bartimaeus could see! The first thing he saw was Jesus. And he did not go back to his place by the road. He followed Jesus along the road, praising God."
    ],
    fact: "Bartimaeus called Jesus \"Son of David,\" showing he believed Jesus was the promised King.",
    question: { q: "What did Bartimaeus do when people told him to be quiet?", choices: ["He went home", "He shouted even louder", "He fell asleep"], answer: 1 },
    challenge: "Don't give up on praying! Keep asking God about something that matters to you."
  },
  {
    id: "resurrection", emoji: "🌅", title: "Jesus Is Alive!", ref: "Matthew 27–28; Luke 24",
    story: [
      "Jesus had told His disciples many times that He would be killed and that on the third day He would rise again. They did not understand what He meant.",
      "On a Friday, Jesus was nailed to a cross, even though He had never done anything wrong. He died to take the punishment for our sins. His body was placed in a tomb cut out of rock, and a huge stone was rolled in front of the entrance. Soldiers guarded it.",
      "Early on Sunday morning, Mary Magdalene and another Mary went to the tomb. Suddenly there was a great earthquake! An angel of the Lord came down from heaven, rolled back the stone and sat on it. His clothes were as white as snow, and the guards shook with fear.",
      "The angel said to the women, \"Don't be afraid. I know you are looking for Jesus, who was crucified. He is not here; He has risen, just as He said! Come and see the place where He lay. Then go quickly and tell His disciples.\"",
      "The women hurried away, afraid yet filled with joy. On the way, Jesus Himself met them and said, \"Greetings!\" They fell at His feet and worshipped Him. Later that day Jesus appeared to His disciples too, and showed them His hands and feet.",
      "Jesus had beaten sin and death! Because He is alive, everyone who believes in Him can be forgiven and live with God forever. That is the best news in the whole world!"
    ],
    fact: "After rising from the dead, Jesus was seen by more than 500 people (1 Corinthians 15:6).",
    question: { q: "Who rolled back the stone from the tomb?", choices: ["The disciples", "An angel of the Lord", "The soldiers"], answer: 1 },
    challenge: "Tell someone the best news ever: \"Jesus is alive!\""
  }
];
