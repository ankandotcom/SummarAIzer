const axios = require("axios");

async function summarizeText(text, retries = 3) {
  const data = JSON.stringify({
    inputs: text,
    parameters: { max_length: 100, min_length: 30 },
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn", // ✅ fixed
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.HUGGING_FACE_API_KEY,
    },
    data,
  };

  try {
    const response = await axios.request(config);

    if (response.data?.error && response.data?.estimated_time) {
      if (retries > 0) {
        const waitTime = Math.min(response.data.estimated_time * 1000, 25000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return summarizeText(text, retries - 1);
      }
      throw new Error("Model is taking too long to load. Please try again.");
    }

    if (Array.isArray(response.data) && response.data[0]?.summary_text) {
      return response.data[0].summary_text;
    } else if (response.data?.summary_text) {
      return response.data.summary_text;
    } else {
      throw new Error("Unexpected response format from Hugging Face.");
    }

  } catch (err) {
    const hfError = err.response?.data;
    if (hfError?.error) throw new Error(`Hugging Face: ${hfError.error}`);
    throw new Error(err.message);
  }
}

module.exports = summarizeText;