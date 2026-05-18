const axios = require("axios");

async function summarizeText(text, retries = 3) {
  const data = JSON.stringify({
    inputs: text,
    parameters: { max_length: 100, min_length: 30 },
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.HUGGING_FACE_API_KEY,
    },
    data,
  };

  try {
    const response = await axios.request(config);

    // ✅ Handle model loading state — wait and retry
    if (response.data?.error && response.data?.estimated_time) {
      if (retries > 0) {
        const waitTime = (response.data.estimated_time || 20) * 1000;
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 25000)));
        return summarizeText(text, retries - 1);
      }
      throw new Error("Model is taking too long to load. Please try again in a moment.");
    }

    if (Array.isArray(response.data) && response.data[0]?.summary_text) {
      return response.data[0].summary_text;
    } else if (response.data?.summary_text) {
      return response.data.summary_text;
    } else {
      throw new Error("Unexpected response format from Hugging Face.");
    }

  } catch (err) {
    // ✅ Better error messages
    const hfError = err.response?.data;
    if (hfError?.error) throw new Error(`Hugging Face: ${hfError.error}`);
    throw new Error(err.message);
  }
}

module.exports = summarizeText;