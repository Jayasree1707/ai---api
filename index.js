const express = require("express");
const app = express();

app.use(express.json());

app.post("/v1/answer", (req, res) => {
  const query = req.body.query;

  const nums = query.match(/\d+/g);

  if (!nums || nums.length < 2) {
    return res.json({ output: "Invalid question." });
  }

  const sum = Number(nums[0]) + Number(nums[1]);

  res.json({
    output: `The sum is ${sum}.`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));