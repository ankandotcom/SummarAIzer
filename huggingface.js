const axios = require("axios");

async function summarizeText(text) {
  let data = JSON.stringify({
    inputs: text,
    parameters: { max_length: 100, min_length: 30 },
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.HUGGING_FACE_API_KEY,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    if (Array.isArray(response.data) && response.data[0]) {
      return response.data[0].summary_text;
    } else if (response.data && response.data.summary_text) {
      return response.data.summary_text;
    } else {
      return "Could not extract summary text format.";
    }
  } catch (err) {
    throw new Error(err.response ? JSON.stringify(err.response.data) : err.message);
  }
}

module.exports = summarizeText;