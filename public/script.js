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
    
    const text_to_summarize = textArea.value; //text to summarize
    const targetLang = document.getElementById('languageSelect').value;
    const summarizedTextArea = document.getElementById("summary");   
    const translatedTextArea = document.getElementById("translatedOutput")
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({ "text_to_summarize": text_to_summarize }),
            redirect: "follow"
        };

        //relative path to “/summarize” because we will be calling the API from our Replit!  
        fetch('/summarize', requestOptions)
        .then(response => response.text()) // Response will be summarized text
        .then(summary => {
            // Doing something with the summary response from the back end API!
            // Updating the output text area with new summary
            summarizedTextArea.textContent = summary;   
            
            //const toTranslateText = summarizedTextArea.textContent;

        // Construct the translation API URL
        let apiUrl = `https://api.mymemory.translated.net/get?q=${summary}&langpair=${"en-GB"}|${targetLang}`;

        // Fetch the translation from the API
        fetch(apiUrl).then(res => res.json()).then(data => {
        // Display the translated text in the output field
        translatedTextArea.textContent = data.responseData.translatedText;

        // Use alternative matches from the API response if available
        data.matches.forEach(data => {
            if (data.id === 0) { // Match id 0 typically contains the highest quality translation
                translatedTextArea.textContent = data.translation;
            }
        });

        // Reset the placeholder to its default state
        //toText.setAttribute("placeholder", "Translation");
        });

        submitButton.classList.remove("submit-button--loading");
        
        })
        .catch(error => {
            console.log(error.message);
        });
        
        //const data = await response.json();
        //document.getElementById('summaryOutput').textContent = data.summary;
        //document.getElementById('translatedOutput').textContent = data.translatedSummary;
    
}