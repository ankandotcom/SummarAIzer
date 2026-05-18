const summarizeText = require("./huggingface");

module.exports = async (req, res) => {
  // Log the incoming request so we can see it in Vercel logs
  console.log("METHOD:", req.method);
  console.log("BODY TYPE:", typeof req.body);
  console.log("BODY:", JSON.stringify(req.body));
  console.log("ENV KEY EXISTS:", !!process.env.HUGGING_FACE_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const text = body?.text_to_summarize;

  if (!text) {
    return res.status(400).send("No text provided. Body was: " + JSON.stringify(body));
  }

  try {
    const summary = await summarizeText(text);
    res.status(200).send(summary);
  } catch (error) {
    console.error("CRASH:", error.message);
    // ✅ Send full error to browser so you can see it directly
    res.status(500).send(`Error: ${error.message}`);
  }
};