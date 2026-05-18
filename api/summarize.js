const summarizeText = require("./huggingface");

module.exports = async (req, res) => {
  // Enable CORS if needed, and handle only POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const text = req.body.text_to_summarize;

  if (!text) {
    return res.status(400).send("No text was provided to summarize.");
  }

  try {
    const summary = await summarizeText(text);
    res.status(200).send(summary);
  } catch (error) {
    res.status(500).send(`Backend Error: ${error.message}`);
  }
};