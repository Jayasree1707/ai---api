const express = require("express");

const app = express();

// Middleware to read JSON body
app.use(express.json());

// POST endpoint
app.post("/v1/answer", (req, res) => {
  try {
    const query = req.body.query;

    // Validate input
    if (!query) {
      return res.json({ output: "Invalid question." });
    }

    // Extract numbers (handles integers, negatives, decimals)
    const nums = query.match(/-?\d+(\.\d+)?/g);

    if (!nums || nums.length < 2) {
      return res.json({ output: "Invalid question." });
    }

    // Take first two numbers
    const num1 = Number(nums[0]);
    const num2 = Number(nums[1]);

    const sum = num1 + num2;

    // Send response
    return res.json({
      output: `The sum is ${sum}.`
    });

  } catch (error) {
    return res.json({ output: "Invalid question." });
  }
});

// Default route (optional but useful)
app.get("/", (req, res) => {
  res.send("AI API is running 🚀");
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});