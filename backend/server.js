const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fruitRoutes = require('./routes/fruits');
const authRoutes = require('./routes/auth'); // NEW

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/fruits', fruitRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => 
{
  console.log(`Server running on port ${PORT}`);
});

