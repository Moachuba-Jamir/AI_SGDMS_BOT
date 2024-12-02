// Preload the logo image at the top of your script
const logoImage = document.createElement("img");
logoImage.setAttribute("src", "./assets/logo.png");
logoImage.classList.add("logo");
logoImage.style.display = "none"; 
document.body.appendChild(logoImage);
const textarea = document.querySelector(".chat-input");
const inputBox = document.querySelector(".input-box");
const inputContainer = document.querySelector(".input-container");
const chatBody = document.querySelector(".chat-body");
const chatContainer = document.querySelector(".chat-container");
const body = document.getElementsByTagName("body");
const welcomeDiv = document.querySelector(".welcome p");
const welcome = document.querySelector(".welcome");
const langBtn = document.querySelector(".btn");
const languageDiv = document.querySelector(".language");
const kbHeight = document.querySelector(".kb-Height");
var originalViewportHeight;
let currentChunk = "";
let chunkIndex = 0;
let count = 0;
var isStreamComplete = false;
var conversationHistory = [];
var myBotMsg;

// detect keyboard
if ("virtualKeyboard" in navigator) {
  // Enable keyboard overlay behavior
  navigator.virtualKeyboard.overlaysContent = true;

  // Listen for geometry changes
  navigator.virtualKeyboard.addEventListener("geometrychange", (event) => {
    const { x, y, width, height } = event.target.boundingRect;

    if (height > 0) {
      console.log("Virtual keyboard visible");
    } else {
      console.log("Virtual keyboard hidden");
    }

    // Adjust UI or layout dynamically
    textarea.style.marginBottom = `${height}px`
  });
}

textarea.addEventListener("focus", () => {

});

document.querySelector("textarea").addEventListener("blur", () => {
  // Reset on blur
  console.log("Keyboard closed or textarea blurred");
});

let scrollTimeout;

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
  analyzingDiv.setAttribute("class", "threeDots");
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
  myBotMsg = createBotResponse();
}

// create the bot response
function createBotResponse() {
  // Clone the preloaded logo to ensure it's ready quickly
  const logo = logoImage.cloneNode(true);
  logo.style.display = "block";
  logo.classList.add("logo-streaming"); // Add glowing class

  // Create a new bot message container
  const botResponseDiv = document.createElement("div");
  botResponseDiv.classList.add("bot-content");
  botResponseDiv.appendChild(logo);

  const botMsg = document.createElement("p");
  botMsg.classList.add(`myBotMsg${count}`); // Use a unique class for each message
  botResponseDiv.appendChild(botMsg);

  const analyzing = document.querySelector(".threeDots");
  chatBody.removeChild(analyzing); // Remove the "analyzing" animation
  chatBody.appendChild(botResponseDiv);

  botResponseDiv.scrollIntoView({ behavior: "smooth" });

  return botMsg; // Return the newly created message element
}

function formatText(text) {
  const listRegex = /^\*\*(.*?)\*\*$/; // **li**
  const emRegex = /^\*(.*?)\*$/; // *em*
  const headerRegex = /^\*\*\*(.*?)\*\*\*$/; // ***h4***

  // Check for bold text
  if (listRegex.test(text)) {
    return `<li>${text.match(listRegex)[1]}</li>`;
  }

  // Check for italic text
  if (emRegex.test(text)) {
    return `<em>${text.match(emRegex)[1]}</em>`;
  }

  // Check for header text
  if (headerRegex.test(text)) {
    return `<h5>${text.match(headerRegex)[1]}</h5>`;
  }

  // Return plain text if no match
  return text;
}

// welcome typing animation
function createWelcomeMessage() {
  const welcomeText = "Hello, what can I help you with?";
  welcomeDiv.innerHTML += ""; // Clear existing text

  let index = 0;
  const typingInterval = setInterval(() => {
    if (index < welcomeText.length) {
      welcomeDiv.innerHTML += welcomeText[index];
      index++;
    } else {
      clearInterval(typingInterval);
    }
  }, 25); // Adjust speed of typing here
}

// Prevent default form submission on Enter (optional)
textarea.addEventListener("keydown", function (e) {
  var bufferedWord;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    textarea.blur();
    textarea.style.marginBottom = "0";

    var userInput = textarea.value;
    //  remove the oldest 2 and keep the rest
    conversationHistory = conversationHistory.slice(
      Math.max(conversationHistory.length - 8, 0)
    );
    conversationHistory.push({ role: "user", content: userInput });

    // var userInput = "tell me something about SGDMS ";
    if (userInput) {
      welcome.style.display = "none";
      // first create userMsg block dnamically and add to the chat body
      createUserMsg(userInput);

      fetch("https://d1c2tzjxcm976d.cloudfront.net/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationHistory }),
      })
        .then((response) => {
          // Create a reader to read the stream
          const reader = response.body.getReader();

          // Create a text decoder to convert chunks to readable text
          const decoder = new TextDecoder();

          // Function to read and log chunks
          function readChunk() {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  console.log("Stream complete");
                  isStreamComplete = true;
                  conversationHistory.push({
                    role: "assistant",
                    content: currentChunk,
                  });

                  console.log(JSON.stringify(conversationHistory.length));
                  return;
                }

                const decodedChunk = decoder.decode(value);
                currentChunk += decodedChunk;
                let bufferedWord = "";
                let isBuffering = false;
                // Start typing animation if not already started
                if (!window.typingInterval) {
                  window.typingInterval = setInterval(() => {
                    if (chunkIndex < currentChunk.length) {
                      var currentChar = currentChunk[chunkIndex];

                      if (currentChar === "*") {
                        // Toggle buffering mode
                        isBuffering = !isBuffering;

                        // If closing asterisk, process the buffered word
                        if (!isBuffering && bufferedWord) {
                          const formatted = formatText(bufferedWord);
                          const span = document.createElement("span");
                          span.innerHTML = formatted;
                          span.classList.add("fade-in-gpt");
                          myBotMsg.appendChild(span);

                          // Reset buffered word
                          bufferedWord = "";
                        }
                      } else if (isBuffering) {
                        // Accumulate characters when buffering
                        bufferedWord += currentChar;
                      } else {
                        // Normal character processing
                        const span = document.createElement("span");
                        span.innerHTML = currentChar;
                        span.classList.add("fade-in-gpt");
                        myBotMsg.appendChild(span);
                      }
                      chunkIndex++;
                    } else {
                      // Stop interval when all characters are typed
                      clearInterval(window.typingInterval);
                      window.typingInterval = null;
                      setTimeout(() => {
                        let logos = document.querySelectorAll(".logo");
                        logos.forEach((logo) => {
                          logo.classList.remove("logo-streaming");
                        });
                      }, 1000);
                    }
                  }, 10); // Adjust speed of typing here
                }

                // Continue reading next chunk
                readChunk();

                if (done) {
                  console.log("chat completed");
                }
              })
              .catch((error) => {
                console.error("Streaming error:", error);
              });
          }

          // Start reading chunks
          readChunk();
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    }
  }
});

langBtn.addEventListener("click", (event) => {
  // Prevent the click event from bubbling up to document
  // Clear chat body
  let userMsgs = document.querySelectorAll(".message-content");
  let botMsgs = document.querySelectorAll(".bot-content");
  userMsgs.forEach((msg) => msg.remove());
  botMsgs.forEach((msg) => msg.remove());
  welcome.style.display = "flex";
  welcomeDiv.innerHTML = "";
  createWelcomeMessage();
  textarea.focus();
  // Reset conversation history
  conversationHistory = [];
  currentChunk = "";
  chunkIndex = 0;
  count = 0;

  // Reset textarea
  textarea.value = "";
  textarea.style.marginBottom = "0";
});

document.addEventListener("DOMContentLoaded", () => {
  originalViewportHeight = window.innerHeight;
  const logo = document.createElement("img");
  logo.setAttribute("src", "./assets/logo.png");
  logo.classList.add("logo");
  createWelcomeMessage();
});
