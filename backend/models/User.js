const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: 
  {
    type: String,
    required: true,
    unique: true
  },
  password: 
  {
    type: String,
    required: true
  },
  role: 
  {
    type: String,
    enum: ['Manager', 'Owner'],
    required: true
  }
}, 
{
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);