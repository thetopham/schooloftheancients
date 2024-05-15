import { HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// 🔥 SET `GOOGLE_API_KEY` IN YOUR .env FILE! 🔥
// 🔥 GET YOUR GEMINI API KEY AT 🔥
// 🔥 https://g.co/ai/idxGetGeminiKey 🔥

const imageChoices = document.querySelectorAll('.image-choice input[type="radio"]');
const sendMessageButton = document.getElementById('send-message');
const messageInput = document.getElementById('chat-message');
const chatBox = document.getElementById('chat-box');
const typingIndicator = document.getElementById('typing-indicator');
const suggestedPromptsList = document.querySelector('#suggested-prompts ul');

let selectedCharacter = 'Albert Einstein'; // Default character

const characterPrompts = {
  "Albert Einstein": [
    "What is the theory of relativity?",
    "How did you come up with E=mc²?",
    "What are your thoughts on the future of science?"
  ],
  "Galileo Galilei": [
    "Tell me about your discoveries with the telescope.",
    "How did you prove that the Earth revolves around the Sun?",
    "What are your thoughts on the relationship between science and religion?"
  ],
  "Leonardo Da Vinci": [
    "What inspired your most famous paintings?",
    "How did you become so skilled in so many different areas?",
    "What are your thoughts on the nature of creativity?"
  ]
};

function updateSuggestedPrompts(character) {
  suggestedPromptsList.innerHTML = ''; 

  characterPrompts[character].forEach(prompt => {
    const listItem = document.createElement('li');
    listItem.textContent = prompt;
    listItem.addEventListener('click', () => { 
      messageInput.value = prompt;
    });
    suggestedPromptsList.appendChild(listItem);
  });
}

updateSuggestedPrompts(selectedCharacter);

imageChoices.forEach(choice => {
  choice.addEventListener('change', () => {
    selectedCharacter = choice.value;
    updateSuggestedPrompts(selectedCharacter);
  });
});

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
  if (userMessage.trim() === '') return;

  displayMessage('user', userMessage);
  messageInput.value = '';

  typingIndicator.style.display = 'block'; // Show typing indicator
  
  const response = await generateResponse(selectedCharacter, userMessage);
  
  typingIndicator.style.display = 'none'; // Hide typing indicator 
  displayMessage('character', response); 
}

async function generateResponse(historicalFigure, userMessage) {
  const prompt = `Imagine you are ${historicalFigure}. 
  Respond to the following question in a way that is consistent 
  with ${historicalFigure}'s personality and knowledge: ${userMessage}`;

  const vision = new ChatGoogleGenerativeAI({
    modelName: 'gemini-pro', 
    // safetySettings: [ ... your safety settings ... ] 
  });

  const response = await vision.call([new HumanMessage(prompt)]);
  return response.content; 
}

function displayMessage(sender, message) {
  const messageContainer = document.createElement('div');
  messageContainer.className = `message-container ${sender}`;

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.textContent = message;
  messageContainer.appendChild(messageDiv);
  chatBox.appendChild(messageContainer);

  chatBox.scrollTop = chatBox.scrollHeight; 
}