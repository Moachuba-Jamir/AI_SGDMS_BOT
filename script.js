// Auto-resize textarea
const textarea = document.querySelector(".chat-input");
const chatBody = document.querySelector(".chat-body");
// const analyzing = document.querySelector(".analyzing");
const welcome = document.querySelector('.welcome');



// Handle input in the textarea
textarea.addEventListener("input", function () {
  const newHeight = Math.min(this.scrollHeight, 1000);
  if (textarea.value != "") {
    this.style.marginBottom = newHeight + 250 + "px";
  } else {
    this.style.marginBottom = "0";
  }
  
});

// Adjust chat body position when the keyboard appears
textarea.addEventListener("focus", () => {

});

textarea.addEventListener("blur", () => {
  // Reset chat body position when the keyboard is hidden
  chatBody.style.paddingBottom = "0";
});

// create the user msg
function createUserMsg(userPrompt) {
  const userMsgdiv = document.createElement("div");
  userMsgdiv.classList.add("message-content");
  const userMsg = document.createElement("p");
  userMsg.classList.add("userMsg");
  userMsg.innerHTML = textarea.value;
  userMsgdiv.appendChild(userMsg);
  chatBody.appendChild(userMsgdiv);
  textarea.value = "";
  // create the analyzing animation
  const analyzingDiv = document.createElement("div");
  analyzingDiv.classList.add("analyzing");
  // const analyzingText = document.createElement("p");
  // analyzingText.innerHTML = "analyzing";
  const span1 = document.createElement("span");
  const span2 = document.createElement("span");
  const span3 = document.createElement("span");

  // analyzingDiv.appendChild(analyzingText);
  analyzingDiv.appendChild(span1);
  analyzingDiv.appendChild(span2);
  analyzingDiv.appendChild(span3);

  chatBody.appendChild(analyzingDiv);

  analyzingDiv.scrollIntoView({ behavior: "smooth" });
}

// create the bot response
function createBotResponse(response) {
  const logo = document.createElement("img");
  logo.setAttribute("src", "./assets/logo.png");
  logo.classList.add("logo");

  const botResponseDiv = document.createElement("div");
  botResponseDiv.classList.add("bot-content");
  const botMsg = document.createElement("p");
  // botMsg.classList.add("botResponse");
  botMsg.innerHTML = response;
  botResponseDiv.appendChild(logo);
  botResponseDiv.appendChild(botMsg);
  const analyzing = document.querySelector(".analyzing");
  chatBody.removeChild(analyzing);
  chatBody.appendChild(botResponseDiv);
  botResponseDiv.scrollIntoView({ behavior: "smooth" });
}
// Prevent default form submission on Enter (optional)
textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    welcome.style.display = "none"
    var userPrompt = textarea.value;
    // first create userMsg block dnamically and add to the chat body
    createUserMsg(userPrompt);

    // fetch call here
    fetch("https://d1c2tzjxcm976d.cloudfront.net/prompt", {
      method: "POST", // Correctly specify the HTTP method
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: userPrompt }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.data);
        // here call the create botResponse fucntion
        createBotResponse(data.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});


document.addEventListener('DOMContentLoaded', () => {
})