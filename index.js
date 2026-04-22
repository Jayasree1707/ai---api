const express = require('express');
const app = express();

app.use(express.json());

app.post('/v1/answer', (req, res) => {
  let { query } = req.body;
  if (!query) return res.json({ output: "0" });

  // =========================
  // 🔥 NORMALIZATION
  // =========================
  const clean = query
    .replace(/[^\w\s+\-*/.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const q = clean.toLowerCase();
  const numbers = clean.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];

  // =========================
  // 🎯 INTENTS
  // =========================
  const isSum = q.includes("sum") || q.includes("add") || q.includes("plus") || query.includes("+");
  const isEvenSum = q.includes("even") && q.includes("sum");

  const isOdd = q.includes("odd");
  const isEven = q.includes("even") && !q.includes("sum");

  const isMax = q.includes("highest") || q.includes("maximum") || q.includes("largest") || q.includes("top");
  const isMin = q.includes("lowest") || q.includes("minimum") || q.includes("smallest");

  const isSubtract = q.includes("subtract") || q.includes("minus") || query.includes("-");
  const isMultiply = q.includes("multiply") || q.includes("product") || query.includes("*");
  const isDivide = q.includes("divide") || query.includes("/");
  const isAverage = q.includes("average") || q.includes("mean");

  const isDifference = q.includes("difference");

  const isCountWords = q.includes("count") && q.includes("word");
  const isSort = q.includes("sort");

  // =========================
  // ✅ 1. SUM EVEN NUMBERS
  // =========================
  if (isEvenSum && numbers.length > 0) {
    const result = numbers.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0);
    return res.json({ output: String(result) });
  }

  // =========================
  // ✅ 2. ADDITION
  // =========================
  if (isSum && numbers.length >= 2) {
    const result = numbers.reduce((a, b) => a + b, 0);
    return res.json({ output: String(result) });
  }

  // =========================
  // ✅ 3. SUBTRACTION
  // =========================
  if (isSubtract && numbers.length >= 2) {
    if (q.includes("from")) {
      return res.json({ output: String(numbers[1] - numbers[0]) });
    }
    return res.json({ output: String(numbers[0] - numbers[1]) });
  }

  // =========================
  // ✅ 4. DIFFERENCE
  // =========================
  if (isDifference && numbers.length >= 2) {
    return res.json({ output: String(Math.abs(numbers[0] - numbers[1])) });
  }

  // =========================
  // ✅ 5. MULTIPLICATION
  // =========================
  if (isMultiply && numbers.length >= 2) {
    const result = numbers.reduce((a, b) => a * b, 1);
    return res.json({ output: String(result) });
  }

  // =========================
  // ✅ 6. DIVISION (FIXED FORMAT)
  // =========================
  if (isDivide && numbers.length >= 2 && numbers[1] !== 0) {
    const result = numbers[0] / numbers[1];
    const formatted = Number.isInteger(result)
      ? String(result)
      : result.toFixed(2).replace(/\.?0+$/, '');
    return res.json({ output: formatted });
  }

  // =========================
  // ✅ 7. AVERAGE (FIXED FORMAT)
  // =========================
  if (isAverage && numbers.length > 0) {
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const formatted = Number.isInteger(avg)
      ? String(avg)
      : avg.toFixed(2).replace(/\.?0+$/, '');
    return res.json({ output: formatted });
  }

  // =========================
  // ✅ 8. DATE EXTRACTION
  // =========================
  const dateMatch = query.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  if (dateMatch) {
    return res.json({ output: dateMatch[0].trim() });
  }

  // =========================
  // ✅ 9. ODD / EVEN
  // =========================
  if (numbers.length > 0) {
    const num = numbers[0];
    if (isOdd) return res.json({ output: num % 2 !== 0 ? "YES" : "NO" });
    if (isEven) return res.json({ output: num % 2 === 0 ? "YES" : "NO" });
  }

  // =========================
  // ✅ 10. NAME + SCORE (FIXED)
  // =========================
  const pairs = [...query.matchAll(/([A-Za-z]+)\s+(?:scored|got|has|runs|marks|points)?\s*(\d+)/gi)];

  if (isMax && pairs.length >= 2) {
    let max = -Infinity;
    let winner = "";

    for (const p of pairs) {
      const name = p[1].trim();
      const score = Number(p[2]);

      if (!isNaN(score) && score > max) {
        max = score;
        winner = name;
      }
    }

    return res.json({ output: winner });
  }

  // =========================
  // ✅ 11. MAX NUMBER
  // =========================
  if (isMax && numbers.length > 0) {
    return res.json({ output: String(Math.max(...numbers)) });
  }

  // =========================
  // ✅ 12. MIN NUMBER
  // =========================
  if (isMin && numbers.length > 0) {
    return res.json({ output: String(Math.min(...numbers)) });
  }

  // =========================
  // ✅ 13. WORD COUNT (FIXED)
  // =========================
  if (isCountWords) {
    const words = clean.split(" ").filter(w => isNaN(w) && w.length > 0);
    return res.json({ output: String(words.length) });
  }

  // =========================
  // ✅ 14. SORT NUMBERS
  // =========================
  if (isSort && numbers.length > 0) {
    const sorted = numbers.sort((a, b) => a - b).join(" ");
    return res.json({ output: sorted });
  }

  // =========================
  // 🔒 SAFE FALLBACK
  // =========================
  return res.json({ output: "0" });
});

// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));