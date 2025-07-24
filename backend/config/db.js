const mongoose = require('mongoose');

const connectDB = async () => 
{
  try 
  {
    await mongoose.connect('mongodb://localhost:27017/fruit-inventory');
    console.log('MongoDB connected successfully');
  } 
  catch (error) 
  {
    console.error('MongoDB connection failed:', error);
  }
};

module.exports = connectDB;