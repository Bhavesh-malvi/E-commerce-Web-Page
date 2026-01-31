export const detectSpam = (text = "") => {

  if (!text || typeof text !== "string") return 0;


  let score = 0;

  const msg = text.trim().toLowerCase();



  // ================= BAD WORDS =================
  const badWords = [
    "fake","scam","fraud","worst","hate","cheap",
    "bad","stupid","idiot","useless","pathetic",
    "garbage","trash","poor","terrible"
  ];

  badWords.forEach(word => {
    if (msg.includes(word)) score += 2;
  });



  // ================= LINK SPAM =================
  const urlRegex = /(https?:\/\/|www\.)/gi;

  if (urlRegex.test(msg)) score += 3;



  // ================= ALL CAPS =================
  const capsRatio =
    text.replace(/[^A-Z]/g,"").length / text.length;

  if (capsRatio > 0.6) score += 2;



  // ================= VERY SHORT =================
  if (msg.length < 20) score += 1;



  // ================= REPEATED TEXT =================
  const words = msg.split(" ");

  const unique = new Set(words);

  if (unique.size / words.length < 0.6) {
    score += 2;
  }



  // ================= EMOJI / SYMBOL SPAM =================
  const emojiCount =
    (text.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;

  if (emojiCount > 5) score += 1;



  // ================= COPY PASTE =================
  if (msg.length > 300) score += 1;



  // ================= NUMBER SPAM =================
  if (/\d{6,}/.test(msg)) score += 1;



  return score;
};
