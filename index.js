const express = require('express');
const app = express();

app.use(express.json());

app.post('/v1/answer', (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.json({ output: "" });
  }

  const q = query.toLowerCase();

  // =========================
  // ✅ Extract numbers
  // =========================
  const numbers = query.match(/\d+/g)?.map(Number) || [];

  // =========================
  // ✅ 1. SUM EVEN NUMBERS
  // =========================
  if (q.includes("sum") && q.includes("even") && numbers.length > 0) {
    const evenSum = numbers.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0);
    return res.json({ output: String(evenSum).trim() });
  }

  // =========================
  // ✅ 2. ADDITION
  // =========================
  if ((q.includes("+") || q.includes("plus")) && numbers.length >= 2) {
    const sum = numbers[0] + numbers[1];
    return res.json({ output: String(sum).trim() });
  }

  // =========================
  // ✅ 3. DATE EXTRACTION
  // =========================
  const dateMatch = query.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  if (dateMatch) {
    return res.json({ output: dateMatch[0].trim() });
  }

  // =========================
  // ✅ 4. ODD / EVEN
  // =========================
  if (numbers.length > 0) {
    const num = numbers[0];

    if (q.includes("odd")) {
      return res.json({ output: num % 2 !== 0 ? "YES" : "NO" });
    }

    if (q.includes("even")) {
      return res.json({ output: num % 2 === 0 ? "YES" : "NO" });
    }
  }

  // =========================
  // ✅ 5. HIGHEST SCORE (IMPROVED)
  // =========================
  if (q.includes("scored") && q.includes("highest")) {

    // Extract all "Name scored number"
    const matches = [...query.matchAll(/([A-Za-z]+)\s+scored\s+(\d+)/gi)];

    let maxScore = -Infinity;
    let winners = [];

    for (const m of matches) {
      const name = m[1].trim();
      const score = Number(m[2]);

      if (score > maxScore) {
        maxScore = score;
        winners = [name];
      } else if (score === maxScore) {
        winners.push(name);
      }
    }

    // Return ONLY name (no extra words)
    return res.json({ output: winners[0].trim() });
  }

  // =========================
  // ❌ DEFAULT
  // =========================
  return res.json({ output: "" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});