const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Start the server
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
