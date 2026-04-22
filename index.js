const express = require('express');
const app = express();

app.use(express.json());

// =========================
// 🔧 HELPERS
// =========================
function cleanOutput(val) {
  if (val === undefined || val === null) return "0";
  return String(val).trim().replace(/\s+/g, ' ');
}

function formatNumber(num) {
  return Number.isInteger(num)
    ? String(num)
    : parseFloat(num.toFixed(2)).toString();
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// =========================
// 🚀 MAIN API
// =========================
app.post('/v1/answer', (req, res) => {
  console.log("🔥 FINAL VERSION RUNNING");

  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.json({ output: "0" });
  }

  const clean = query
    .replace(/[^\w\s+\-*/.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const q = clean.toLowerCase();
  const numbers = clean.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];

  // =========================
  // 🎯 INTENTS
  // =========================
  const isMax = q.includes("highest") || q.includes("maximum") || q.includes("largest") || q.includes("top");
  const isMin = q.includes("lowest") || q.includes("minimum") || q.includes("smallest");

  const isAdd = q.includes("add") || q.includes("plus") || q.includes("sum") || query.includes("+");
  const isSubtract = q.includes("subtract") || q.includes("minus") || query.includes("-");
  const isMultiply = q.includes("multiply") || q.includes("product") || query.includes("*");
  const isDivide = q.includes("divide") || query.includes("/");
  const isAverage = q.includes("average") || q.includes("mean");

  const isEvenSum = q.includes("even") && q.includes("sum");
  const isOdd = q.includes("odd");
  const isEven = q.includes("even") && !q.includes("sum");

  const isDifference = q.includes("difference");
  const isCountWords = q.includes("count") || q.includes("how many words");
  const isSort = q.includes("sort");

  // =========================
  // 🥇 1. NAME + SCORE
  // =========================
  const pairs = [...query.matchAll(/([A-Za-z]+)\s+(?:scored|got|has|runs|marks|points)?\s*(\d+)/gi)];

  if (isMax && pairs.length >= 2) {
    let max = -Infinity;
    let winner = "";

    for (const p of pairs) {
      const name = p[1];
      const score = Number(p[2]);

      if (!isNaN(score) && score > max) {
        max = score;
        winner = name;
      }
    }

    if (winner) {
      return res.json({ output: capitalize(winner) });
    }
  }

  // =========================
  // 📅 DATE
  // =========================
  const dateMatch = query.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  if (dateMatch) {
    return res.json({ output: cleanOutput(dateMatch[0]) });
  }

  // =========================
  // 🔢 SUM EVEN
  // =========================
  if (isEvenSum && numbers.length > 0) {
    const result = numbers.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0);
    return res.json({ output: cleanOutput(result) });
  }

  // =========================
  // ➕ ADD
  // =========================
  if (isAdd && numbers.length >= 2) {
    return res.json({ output: cleanOutput(numbers.reduce((a, b) => a + b, 0)) });
  }

  // =========================
  // ➖ SUBTRACT
  // =========================
  if (isSubtract && numbers.length >= 2) {
    const result = q.includes("from")
      ? numbers[1] - numbers[0]
      : numbers[0] - numbers[1];
    return res.json({ output: cleanOutput(result) });
  }

  // =========================
  // 🔄 DIFFERENCE
  // =========================
  if (isDifference && numbers.length >= 2) {
    return res.json({ output: cleanOutput(Math.abs(numbers[0] - numbers[1])) });
  }

  // =========================
  // ✖️ MULTIPLY
  // =========================
  if (isMultiply && numbers.length >= 2) {
    return res.json({ output: cleanOutput(numbers.reduce((a, b) => a * b, 1)) });
  }

  // =========================
  // ➗ DIVIDE
  // =========================
  if (isDivide && numbers.length >= 2 && numbers[1] !== 0) {
    return res.json({ output: cleanOutput(formatNumber(numbers[0] / numbers[1])) });
  }

  // =========================
  // 📊 AVERAGE
  // =========================
  if (isAverage && numbers.length > 0) {
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return res.json({ output: cleanOutput(formatNumber(avg)) });
  }

  // =========================
  // 🔢 MAX / MIN
  // =========================
  if (numbers.length > 0) {
    if (isMax) return res.json({ output: cleanOutput(Math.max(...numbers)) });
    if (isMin) return res.json({ output: cleanOutput(Math.min(...numbers)) });
  }

  // =========================
  // 🔍 ODD / EVEN
  // =========================
  if (numbers.length > 0) {
    const num = numbers[0];

    if (isOdd) return res.json({ output: num % 2 !== 0 ? "YES" : "NO" });
    if (isEven) return res.json({ output: num % 2 === 0 ? "YES" : "NO" });
  }

  // =========================
  // 🔤 WORD COUNT
  // =========================
  if (isCountWords) {
    const words = clean.split(" ").filter(w => isNaN(w) && w.length > 0);
    return res.json({ output: cleanOutput(words.length) });
  }

  // =========================
  // 🔃 SORT
  // =========================
  if (isSort && numbers.length > 0) {
    return res.json({ output: cleanOutput(numbers.sort((a, b) => a - b).join(" ")) });
  }

  // =========================
  // 🔒 FALLBACK
  // =========================
  return res.json({ output: "0" });
});

// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));