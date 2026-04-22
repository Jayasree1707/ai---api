const express = require('express');
const app = express();

app.use(express.json());

app.post('/v1/answer', (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.json({ output: "Invalid question." });
  }

  const q = query.toLowerCase();

  // =========================
  // ✅ 1. ADDITION
  // =========================
  const numbers = query.match(/\d+/g);
  if (numbers && numbers.length >= 2 && (q.includes('+') || q.includes('plus'))) {
    const sum = Number(numbers[0]) + Number(numbers[1]);
    return res.json({
      output: `The sum is ${sum}.`
    });
  }

  // =========================
  // ✅ 2. DATE EXTRACTION
  // =========================
  const dateMatch = query.match(/\d{1,2}\s[A-Za-z]+\s\d{4}/);
  if (dateMatch) {
    return res.json({
      output: dateMatch[0]
    });
  }

  // =========================
  // ✅ 3. ODD / EVEN CHECK
  // =========================
  const singleNumber = query.match(/\d+/);
  if (singleNumber) {
    const num = Number(singleNumber[0]);

    if (q.includes("odd")) {
      return res.json({ output: num % 2 !== 0 ? "YES" : "NO" });
    }

    if (q.includes("even") && !q.includes("sum")) {
      return res.json({ output: num % 2 === 0 ? "YES" : "NO" });
    }
  }

  // =========================
  // ✅ 4. SUM EVEN NUMBERS
  // =========================
  if (q.includes("sum") && q.includes("even")) {
    const nums = query.match(/\d+/g);

    if (nums) {
      const sumEven = nums
        .map(n => Number(n))
        .filter(n => n % 2 === 0)
        .reduce((a, b) => a + b, 0);

      return res.json({
        output: sumEven.toString()
      });
    }
  }

  // =========================
  // ✅ 5. HIGHEST SCORE
  // =========================
  if (q.includes("scored") && q.includes("highest")) {
    const matches = [...query.matchAll(/([A-Za-z]+)\s+scored\s+(\d+)/g)];

    if (matches.length > 0) {
      let maxName = "";
      let maxScore = -Infinity;

      matches.forEach(match => {
        const name = match[1];
        const score = Number(match[2]);

        if (score > maxScore) {
          maxScore = score;
          maxName = name;
        }
      });

      return res.json({
        output: maxName
      });
    }
  }

  // =========================
  // ❌ DEFAULT
  // =========================
  return res.json({
    output: "Invalid question."
  });
});

// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});