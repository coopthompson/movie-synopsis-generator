const express = require('express');
const app = express();
const PORT = 3197;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Test!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
