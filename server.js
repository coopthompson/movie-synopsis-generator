const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require("openai");
require('dotenv').config();

const app = express();
const PORT = 3197;

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
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
