const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Handle clean URLs (serve .html files without extension)
const path_module = require('path');
app.get('/', (req, res) => res.sendFile(path_module.join(__dirname, 'index.html')));
app.get('/contact', (req, res) => res.sendFile(path_module.join(__dirname, 'contact.html')));
app.get('/payment', (req, res) => res.sendFile(path_module.join(__dirname, 'payment.html')));
app.get('/numbers', (req, res) => res.sendFile(path_module.join(__dirname, 'numbers.html')));

// Serve static files (css, js, images etc.)
app.use(express.static(__dirname));

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({ booked: [] }, null, 2));
}

// Get status of all numbers (1-31)
app.get('/api/numbers', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const result = [];
    for (let i = 1; i <= 31; i++) {
      result.push({
        number: i,
        status: data.booked.includes(i) ? 'soldout' : 'available'
      });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Book a number
app.post('/api/book', (req, res) => {
  const { number } = req.body;
  if (typeof number !== 'number' || number < 1 || number > 31) {
    return res.status(400).json({ error: 'Invalid number. Must be between 1 and 31.' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Check if already booked
    if (data.booked.includes(number)) {
      return res.status(400).json({ error: 'Number is already sold out.' });
    }
    
    // Add to booked list and save
    data.booked.push(number);
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    
    res.json({ success: true, message: `Number ${number} booked successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
