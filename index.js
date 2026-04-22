const express = require('express');
const app = express();

app.use(express.json());

// ✅ MAIN ENDPOINT
app.post('/v1/answer', (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.json({ output: "Invalid question." });
  }

  // =========================
  // ✅ 1. ADDITION HANDLER
  // =========================
  const numbers = query.match(/\d+/g);
  if (numbers && numbers.length >= 2 && query.includes('+')) {
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
  // ❌ DEFAULT RESPONSE
  // =========================
  return res.json({
    output: "Invalid question."
  });
});

// ✅ SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});