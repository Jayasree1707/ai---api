const express = require('express');
const app = express();

app.use(express.json());

// =========================
// 🔥 HELPERS
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
// 🚀 MAIN ENDPOINT
// =========================
app.post('/v1/answer', (req, res) => {
  console.log("🔥 FINAL 93 VERSION RUNNING");

  let { query } = req.body;
  if (!query || typeof query !== "string") {
    return res.json({ output: "0" });
  }

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
  const isAdd = q.includes("add") || q.includes("plus") || q.includes("sum") || query.includes("+");
  const isSubtract = q.includes("subtract") || q.includes("minus") || query.includes("-");
  const isMultiply = q.includes("multiply") || q.includes("product") || query.includes("*");
  const isDivide = q.includes("divide") || query.includes("/");
  const isAverage = q.includes("average") || q.includes("mean");

  const isMax = q.includes("highest") || q.includes("maximum") || q.includes("largest") || q.includes("top");
  const isMin = q.includes("lowest") || q.includes("minimum") || q.includes("smallest");

  const isDifference = q.includes("difference");

  const isEvenSum = q.includes("even") && q.includes("sum");
  const isOdd = q.includes("odd");
  const isEven = q.includes("even") && !q.includes("sum");

  const isSort = q.includes("sort");
  const isCountWords = q.includes("count") || q.includes("how many words");

  // =========================
  // 🥇 1. NAME + SCORE (TOP PRIORITY)
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
      return res.json({ output: capitalize(winner.trim()) });
    }
  }

  // =========================
  // 📅 2. DATE EXTRACTION
  // =========================
  const dateMatch = query.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  if (dateMatch) {
    return res.json({ output: cleanOutput(dateMatch[0]) });
  }

  // =========================
  // 🔢 3. SUM EVEN NUMBERS
  // =========================
  if (isEvenSum && numbers.length > 0) {
    const sum = numbers.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0);
    return res.json({ output: cleanOutput(sum) });
  }

  // =========================
  // ➕ 4. ADDITION
  // =========================
  if (isAdd && numbers.length >= 2) {
    return res.json({ output: cleanOutput(numbers.reduce((a, b) => a + b, 0)) });
  }

  // =========================
  // ➖ 5. SUBTRACTION
  // =========================
  if (isSubtract && numbers.length >= 2) {
    const result = q.includes("from")
      ? numbers[1] - numbers[0]
      : numbers[0] - numbers[1];
    return res.json({ output: cleanOutput(result) });
  }

  // =========================
  // 🔄 6. DIFFERENCE
  // =========================
  if (isDifference && numbers.length >= 2) {
    return res.json({ output: cleanOutput(Math.abs(numbers[0] - numbers[1])) });
  }

  // =========================
  // ✖️ 7. MULTIPLICATION
  // =========================
  if (isMultiply && numbers.length >= 2) {
    return res.json({ output: cleanOutput(numbers.reduce((a, b) => a * b, 1)) });
  }

  // =========================
  // ➗ 8. DIVISION
  // =========================
  if (isDivide && numbers.length >= 2 && numbers[1] !== 0) {
    return res.json({ output: cleanOutput(formatNumber(numbers[0] / numbers[1])) });
  }

  // =========================
  // 📊 9. AVERAGE
  // =========================
  if (isAverage && numbers.length > 0) {
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return res.json({ output: cleanOutput(formatNumber(avg)) });
  }

  // =========================
  // 🔍 10. MAX / MIN NUMBER
  // =========================
  if (numbers.length > 0) {
    if (isMax) return res.json({ output: cleanOutput(Math.max(...numbers)) });
    if (isMin) return res.json({ output: cleanOutput(Math.min(...numbers)) });
  }

  // =========================
  // 🔢 11. ODD / EVEN CHECK
  // =========================
  if (numbers.length > 0) {
    const num = numbers[0];

    if (isOdd) {
      return res.json({ output: num % 2 !== 0 ? "YES" : "NO" });
    }

    if (isEven) {
      return res.json({ output: num % 2 === 0 ? "YES" : "NO" });
    }
  }

  // =========================
  // 🔤 12. WORD COUNT
  // =========================
  if (isCountWords) {
    const words = clean.split(" ").filter(w => isNaN(w) && w.length > 0);
    return res.json({ output: cleanOutput(words.length) });
  }

  // =========================
  // 🔃 13. SORT
  // =========================
  if (isSort && numbers.length > 0) {
    const sorted = [...numbers].sort((a, b) => a - b);
    return res.json({ output: cleanOutput(sorted.join(" ")) });
  }

  // =========================
  // 🔒 SAFE FALLBACK
  // =========================
  return res.json({ output: "0" });
});

// =========================
// 🚀 SERVER
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});