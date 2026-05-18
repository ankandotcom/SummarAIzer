const textArea = document.getElementById("textInput");
const submitButton = document.getElementById("submit-button");
submitButton.disabled = true;
textArea.addEventListener("input", verifyTextLength);
submitButton.addEventListener('click', submitData);

function verifyTextLength(e) {
    const textarea = e.target;

    if (textarea.value.length > 200 && textarea.value.length < 100000) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

function submitData(e) {
    e.preventDefault();
    submitButton.classList.add("submit-button--loading");

    const text_to_summarize = textArea.value;
    const targetLang = document.getElementById('languageSelect').value;
    const summarizedTextArea = document.getElementById("summary");
    const translatedTextArea = document.getElementById("translatedOutput");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ "text_to_summarize": text_to_summarize }),
        redirect: "follow"
    };

    // 1. Fetch Summary from your backend
    fetch('/api/summarize', requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server returned status: ${response.status}`);
            }
            return response.text();
        })
        .then(summary => {
            // Display the summary text
            summarizedTextArea.textContent = summary;

            // CRITICAL FIX: Safe URI encoding to prevent query string breakdown
            const safeSummaryText = encodeURIComponent(summary.trim());
            let apiUrl = `https://api.mymemory.translated.net/get?q=${safeSummaryText}&langpair=en|${targetLang}`;

            // 2. Fetch Translation from third-party API
            return fetch(apiUrl);
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.responseData) {
                translatedTextArea.textContent = data.responseData.translatedText;
            }

            // Fallback for highest quality alternative match if it exists
            if (data.matches && data.matches.length > 0) {
                data.matches.forEach(match => {
                    if (match.id === 0 || match.id === "0") {
                        translatedTextArea.textContent = match.translation;
                    }
                });
            }
            submitButton.classList.remove("submit-button--loading");
        })
        .catch(error => {
            console.error("Error encountered:", error.message);
            submitButton.classList.remove("submit-button--loading");
            // ✅ Show the actual error instead of a generic message
            summarizedTextArea.textContent = `Error: ${error.message}`;
        });
}