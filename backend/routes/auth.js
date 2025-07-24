const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple login with role return
router.post('/login', async (req, res) => 
{
  try 
  {
    const { username, password } = req.body;
    
    if (!username || !password) 
    {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await User.findOne({ username, password });
    
    if (!user) 
    {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      success: true,
      message: `Welcome ${user.role}!`,
      user: 
      {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
});

// Create default users
router.post('/setup', async (req, res) => 
{
  try 
  {
    const existingUsers = await User.find();
    
    if (existingUsers.length > 0) 
    {
      return res.json({ 
        message: 'Users already exist',
        users: existingUsers.map(u => ({ username: u.username, role: u.role }))
      });
    }
    
    const manager = new User({
      username: 'manager',
      password: '123456',
      role: 'Manager'
    });
    
    const owner = new User({
      username: 'owner',
      password: '123456',
      role: 'Owner'
    });
    
    await manager.save();
    await owner.save();
    
    res.json({ 
      message: 'Default users created successfully',
      users: [
        { username: 'manager', password: '123456', role: 'Manager' },
        { username: 'owner', password: '123456', role: 'Owner' }
      ]
    });
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
});

// Get all users 
router.get('/users', async (req, res) => 
{
  try 
  {
    const users = await User.find().select('-password');
    res.json(users);
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;