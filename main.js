import { HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { marked } from 'marked';

// 🔥 SET `GOOGLE_API_KEY` IN YOUR .env FILE! 🔥
// 🔥 GET YOUR GEMINI API KEY AT 🔥
// 🔥 https://g.co/ai/idxGetGeminiKey 🔥

const imageSelection = document.getElementById('image-selection');
const sendMessageButton = document.getElementById('send-message');
const messageInput = document.getElementById('chat-message');
const chatBox = document.getElementById('chat-box');
const typingIndicator = document.getElementById('typing-indicator');

let selectedCharacter = ''; 
let conversationHistory = {}; // Store conversation history per character

const characterData = {
    "Albert Einstein": {
        image: "/alberteinstien.jpg",
        description: 'physicist',
        timeframe: 'early 20th century',
        expertise: 'scientific background',
        passion: 'exploring the mysteries of the universe',
        prompts: [
            "What is the theory of relativity?",
            "How did you come up with E=mc²?",
            "What are your thoughts on the future of science?"
        ]
    },
    "Galileo Galilei": {
        image: "/galileogalilei.jpg",
        description: 'astronomer and physicist',
        timeframe: '16th and 17th centuries',
        expertise: 'astronomical and scientific knowledge',
        passion: 'understanding the cosmos',
        prompts: [
            "Tell me about your discoveries with the telescope.",
            "How did you prove that the Earth revolves around the Sun?",
            "What are your thoughts on the relationship between science and religion?"
        ]
    },
    "Leonardo Da Vinci": {
        image: "/leonardodavinci.jpg",
        description: 'artist, inventor, and scientist',
        timeframe: '15th and 16th centuries',
        expertise: 'artistic, scientific, and engineering skills',
        passion: 'discovering the secrets of nature',
        prompts: [
            "What inspired your most famous paintings?",
            "How did you become so skilled in so many different areas?",
            "What are your thoughts on the nature of creativity?"
        ]
    }
};

// Function to create and display image choices
function displayImageChoices() {
    for (const character in characterData) {
        const imageChoice = document.createElement('label');
        imageChoice.classList.add('image-choice');
        imageChoice.innerHTML = `
            <input type="radio" name="chosen-image" value="${character}">
            <img src="${characterData[character].image}" alt="${character}">
            <span class="character-name">${character}</span>
        `;
        imageSelection.appendChild(imageChoice);

        // Add event listener for image selection
        imageChoice.addEventListener('click', () => {
            selectCharacter(character);
        });
        
    }
    
}

// Call the function to display the choices when the page loads
displayImageChoices();

function selectCharacter(character) {
    selectedCharacter = character;

    // Remove 'selected' class from all choices
    const imageChoices = document.querySelectorAll('.image-choice');
    imageChoices.forEach(choice => choice.classList.remove('selected'));

    // Add 'selected' class to the chosen character
    const selectedChoice = document.querySelector(`.image-choice input[value="${character}"]`).parentElement;
    selectedChoice.classList.add('selected');

    // Clear the chat box
    chatBox.innerHTML = ''; 

    // Display welcome message
    displayMessage('system', 'Welcome to the School of the Ancients! Ask me anything.');
    
    // Display suggested prompts
    displaySuggestedPrompts(character); 

    // Load conversation history or initialize if none
    if (conversationHistory[character]) {
      // Remove previous prompts before loading history 
      const previousPrompts = chatBox.querySelector("#suggested-prompts"); 
      if (previousPrompts) { 
          chatBox.removeChild(previousPrompts);
      }
      loadConversationHistory(character); 
  } else {
      conversationHistory[character] = [];
      displayMessage('system', 'Welcome to the School of the Ancients! Ask me anything.'); 
  }

  // Display suggested prompts (always AFTER handling history)
  displaySuggestedPrompts(character); 
}

sendMessageButton.addEventListener('click', async () => {
    sendMessage(); 
});

messageInput.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') { 
        sendMessage();
    }
});

async function sendMessage() {
    const userMessage = messageInput.value;
    if (userMessage.trim() === '' || selectedCharacter === '') return; // Don't send if no message or character

    displayMessage('user', userMessage);
    messageInput.value = '';

    typingIndicator.style.display = 'block'; 

    const response = await generateResponse(selectedCharacter, userMessage);
    
    typingIndicator.style.display = 'none'; 
    displayMessage('character', response); 
}

async function generateResponse(historicalFigure, userMessage) {
    const prompt = `You are ${historicalFigure}, a renowned ${characterData[historicalFigure].description}, living in the ${characterData[historicalFigure].timeframe}. You are in a school where people can ask historical figures questions.  Respond to the following question in a tone that is both insightful and approachable, like you would explain complex concepts to a curious student.  Use language that reflects your ${characterData[historicalFigure].expertise} and your passion for ${characterData[historicalFigure].passion}. Feel free to use Markdown to format your responses, including bold text, italics, and bullet points, to help illustrate your points. Strive for detailed and insightful answers, but keep them concise when possible.  

    **Consider the following:**

    * **Accuracy:** Ensure your responses are historically accurate to the best of your knowledge. If you are uncertain, acknowledge that you don't have all the information.
    * **Perspective:** Respond from the perspective of ${historicalFigure}, incorporating their known beliefs, values, and writing style.
    * **Engaging Tone:**  Make your answers interesting and insightful, stimulating further discussion.

    For example, if someone asked, "What is the theory of relativity?", you might answer (as Albert Einstein):
    "The theory of relativity is a fundamental concept in modern physics that revolutionized our understanding of space, time, gravity, and the universe... [continue with your explanation in Einstein's voice]".

    Now, respond to this question: ${userMessage}`;

    try {
        const vision = new ChatGoogleGenerativeAI({
            modelName: 'gemini-pro', 
            // safetySettings: [ ... your safety settings ... ] 
        });

        const response = await vision.call([new HumanMessage(prompt)]);

        // Update conversation history
        conversationHistory[historicalFigure].push({sender: 'user', message: userMessage});
        conversationHistory[historicalFigure].push({sender: 'character', message: response.content}); 

        return response.content; 
    } catch (error) {
        console.error("Error generating response:", error);
        // Display error message to the user 
        displayMessage('system', 'I\'m sorry, I\'m having trouble accessing my knowledge right now. Please try again later.');
        return; 
    }
}

function displayMessage(sender, message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${sender}`;

    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = sender === 'user' ? 'You:' : selectedCharacter + ":"; 
    messageContainer.appendChild(label);

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = marked(message); // Use marked to render Markdown
    messageContainer.appendChild(messageDiv);

    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function displaySuggestedPrompts(character) {
  const suggestedPromptsContainer = document.createElement('div');
  suggestedPromptsContainer.id = "suggested-prompts";
  suggestedPromptsContainer.innerHTML = '<h3>Suggested Questions:</h3>';

  const promptList = document.createElement('ul');
  characterData[character].prompts.forEach(prompt => {
      const listItem = document.createElement('li');
      listItem.textContent = prompt;

      // Add a class for styling:
      listItem.classList.add('clickable-prompt');

      listItem.addEventListener('click', () => {
          messageInput.value = prompt;
      });
      promptList.appendChild(listItem);
  });

  suggestedPromptsContainer.appendChild(promptList);
  chatBox.appendChild(suggestedPromptsContainer);
}

function loadConversationHistory(character) {
  chatBox.innerHTML = ''; // Clear the chat box
  conversationHistory[character].forEach(turn => {
      displayMessage(turn.sender, turn.message);
  });
}