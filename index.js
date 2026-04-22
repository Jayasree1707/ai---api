const express = require('express');
const app = express();

app.use(express.json());

function clean(val) {
  return String(val).trim();
}

app.post('/v1/answer', (req, res) => {
  let { query } = req.body;
  if (!query) return res.json({ output: "" });

  const original = query;
  const q = query.toLowerCase();

  const numbers = (query.match(/-?\d+(\.\d+)?/g) || []).map(Number);

  // =========================
  // 1. DATE
  // =========================
  const dateMatch = original.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  if (dateMatch) {
    return res.json({ output: clean(dateMatch[0]) });
  }

  // =========================
  // 2. ODD / EVEN
  // =========================
  if (numbers.length > 0) {
    if (q.includes("odd")) {
      return res.json({ output: numbers[0] % 2 !== 0 ? "YES" : "NO" });
    }
    if (q.includes("even") && !q.includes("sum")) {
      return res.json({ output: numbers[0] % 2 === 0 ? "YES" : "NO" });
    }
  }

  // =========================
  // 3. SUM EVEN
  // =========================
  if (q.includes("sum") && q.includes("even")) {
    const result = numbers.filter(n => n % 2 === 0).reduce((a,b)=>a+b,0);
    return res.json({ output: clean(result) });
  }

  // =========================
  // 4. ADD
  // =========================
  if (q.includes("add") || q.includes("plus") || original.includes("+")) {
    return res.json({ output: clean(numbers.reduce((a,b)=>a+b,0)) });
  }

  // =========================
  // 5. SUBTRACT
  // =========================
  if (q.includes("subtract") || q.includes("minus") || original.includes("-")) {
    const result = q.includes("from")
      ? numbers[1] - numbers[0]
      : numbers[0] - numbers[1];
    return res.json({ output: clean(result) });
  }

  // =========================
  // 6. MULTIPLY
  // =========================
  if (q.includes("multiply") || q.includes("product") || original.includes("*")) {
    return res.json({ output: clean(numbers.reduce((a,b)=>a*b,1)) });
  }

  // =========================
  // 7. DIVIDE
  // =========================
  if (q.includes("divide") || original.includes("/")) {
    const result = numbers[0] / numbers[1];
    return res.json({ output: clean(Number.isInteger(result) ? result : parseFloat(result.toFixed(2))) });
  }

  // =========================
  // 8. AVERAGE
  // =========================
  if (q.includes("average") || q.includes("mean")) {
    const avg = numbers.reduce((a,b)=>a+b,0)/numbers.length;
    return res.json({ output: clean(Number.isInteger(avg) ? avg : parseFloat(avg.toFixed(2))) });
  }

  // =========================
  // 9. DIFFERENCE
  // =========================
  if (q.includes("difference")) {
    return res.json({ output: clean(Math.abs(numbers[0] - numbers[1])) });
  }

  // =========================
  // 10. MAX (NUMBER)
  // =========================
  if (q.includes("highest") || q.includes("maximum") || q.includes("largest")) {
    const pairs = [...original.matchAll(/([A-Za-z]+)[^\d]*(\d+)/g)];

    if (pairs.length >= 2) {
      let max = -Infinity;
      let winner = "";

      for (const p of pairs) {
        const name = p[1];
        const score = Number(p[2]);

        if (score > max) {
          max = score;
          winner = name;
        }
      }

      return res.json({ output: clean(winner) });
    }

    return res.json({ output: clean(Math.max(...numbers)) });
  }

  // =========================
  // 11. MIN
  // =========================
  if (q.includes("lowest") || q.includes("minimum") || q.includes("smallest")) {
    return res.json({ output: clean(Math.min(...numbers)) });
  }

  // =========================
  // 12. SORT
  // =========================
  if (q.includes("sort")) {
    return res.json({ output: clean(numbers.sort((a,b)=>a-b).join(" ")) });
  }

  // =========================
  // 13. WORD COUNT
  // =========================
  if (q.includes("count") && q.includes("word")) {
    const words = q.split(" ").filter(w => isNaN(w));
    return res.json({ output: clean(words.length) });
  }

  // =========================
  // FINAL FALLBACK
  // =========================
  return res.json({ output: "" });
});

const PORT = process.env.PORT || 3000;

console.log("🔥 FINAL VERSION DEPLOYED");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});