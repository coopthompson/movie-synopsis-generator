// This page handles the backend for the project. It is a node.js and express dependent backend. It also calls
// the OpenAI API.

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require("openai");
require('dotenv').config();

const app = express();
const PORT = 3197;

// This is where my OpenAI key is input, it exists in a .env file.
const openai = new OpenAI({
    apiKey: process.env.MY_KEY
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'No prompt provided' });
    }

    try {
        // Used to generate a response from the OpenAI API.
        const response = await openai.chat.completions.create({
            // This is the model version I am using to generate my prompt.
            model: 'gpt-3.5-turbo',
            messages: [
            // The system is the general format of response while the user is the provided user input (the prompt)
                { role: 'system', content: 'You are an AI that creates movie synopses based on provided prompts.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 200
        });

        res.json({ synopsis: response.choices[0].message.content.trim() });

    } catch (error) {
        console.error('Error generating synopsis:', error);
        res.status(500).json({ error: 'Error generating synopsis' });
    }
});

// I run the app on a local port numbered 3197. I use npm start as my build command.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
