import { HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { marked } from 'marked';

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

// Display the welcome message when the page loads
displayMessage('system', 'Welcome to the School of the Ancients! Choose a historical figure and ask them a question.');

// Add event listeners after the welcome message is displayed
imageChoices.forEach(choice => {
  choice.addEventListener('change', () => {
    selectedCharacter = choice.value;
    updateSuggestedPrompts(selectedCharacter);

    // Clear the chat box
    chatBox.innerHTML = ''; 

    // Display welcome message again
    displayMessage('system', 'Welcome to the School of the Ancients! Choose a historical figure and ask them a question.');
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
  const prompt = `You are ${historicalFigure}, a renowned ${getHistoricalFigureDescription(historicalFigure)}, living in the ${getHistoricalFigureTimeframe(historicalFigure)}. You are in a school where people can ask historical figures questions.  Respond to the following question in a tone that is both insightful and approachable, like you would explain complex concepts to a curious student.  Use language that reflects your ${getHistoricalFigureExpertise(historicalFigure)} and your passion for ${getHistoricalFigurePassion(historicalFigure)}. Feel free to use Markdown to format your responses, including bold text, italics, and bullet points, to help illustrate your points. Strive for detailed and insightful answers, but keep them concise when possible. 

For example, if someone asked, "What is the theory of relativity?", you might answer:
"The theory of relativity is a fundamental concept in modern physics... [continue with your explanation in Einstein's voice]".

Now, respond to this question: ${userMessage}`;

  const vision = new ChatGoogleGenerativeAI({
    modelName: 'gemini-pro', 
    // safetySettings: [ ... your safety settings ... ] 
  });

  const response = await vision.call([new HumanMessage(prompt)]);
  return response.content; 
}

function getHistoricalFigureDescription(historicalFigure) {
  switch (historicalFigure) {
    case 'Albert Einstein': return 'physicist';
    case 'Galileo Galilei': return 'astronomer and physicist';
    case 'Leonardo Da Vinci': return 'artist, inventor, and scientist';
    default: return 'historical figure';
  }
}

function getHistoricalFigureTimeframe(historicalFigure) {
  switch (historicalFigure) {
    case 'Albert Einstein': return 'early 20th century';
    case 'Galileo Galilei': return '16th and 17th centuries';
    case 'Leonardo Da Vinci': return '15th and 16th centuries';
    default: return 'historical period';
  }
}

function getHistoricalFigureExpertise(historicalFigure) {
  switch (historicalFigure) {
    case 'Albert Einstein': return 'scientific background';
    case 'Galileo Galilei': return 'astronomical and scientific knowledge';
    case 'Leonardo Da Vinci': return 'artistic, scientific, and engineering skills';
    default: return 'expertise';
  }
}

function getHistoricalFigurePassion(historicalFigure) {
  switch (historicalFigure) {
    case 'Albert Einstein': return 'exploring the mysteries of the universe';
    case 'Galileo Galilei': return 'understanding the cosmos';
    case 'Leonardo Da Vinci': return 'discovering the secrets of nature';
    default: return 'passion';
  }
}

function displayMessage(sender, message) {
  const messageContainer = document.createElement('div');
  messageContainer.className = `message-container ${sender}`;

  // Add label before message content:
  let labelText = sender === 'user' ? 'User:' : selectedCharacter + ":";  
  const label = document.createElement('span');
  label.className = 'message-label';
  label.textContent = labelText;
  messageContainer.appendChild(label);

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.innerHTML = marked(message);
  messageContainer.appendChild(messageDiv);

  chatBox.appendChild(messageContainer);
  chatBox.scrollTop = chatBox.scrollHeight; 
}