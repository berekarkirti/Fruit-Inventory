const express = require('express');
const router = express.Router();
const Fruit = require('../models/Fruit');
const { managerOrOwner, ownerOnly } = require('../middleware/auth');

// Get all fruits (Both Manager and Owner can view)
router.get('/', managerOrOwner, async (req, res) => 
{
  try 
  {
    let query = {};
    
    // Manager can only see their own added items + approved items
    if (req.user.role === 'Manager') 
    {
      query = 
      {
        $or: 
        [
          { addedBy: req.user.username },
          { status: 'Approved' }
        ]
      };
    }

    // Owner can see all items
    const fruits = await Fruit.find(query).sort({ createdAt: -1 });
    res.json(fruits);

  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
});

// Add new fruit (Only Manager can add)
router.post('/', managerOrOwner, async (req, res) => 
{
  try 
  {
    const { productName, state, price, remark, quantity } = req.body;
    
    // Auto-set state based on fruit name
    const fruitStateMapping = 
    {
      'Apple': 'Kashmir',
      'Banana': 'Kerala', 
      'Orange': 'Nagpur',
      'Mango': 'Uttar Pradesh',
      'Grapes': 'Maharashtra',
      'Pomegranate': 'Maharashtra'
    };
    
    const autoState = fruitStateMapping[productName] || state;
    
    const fruit = new Fruit({
      productName,
      state: autoState,
      price: Number(price),
      remark: remark || 'Available',
      quantity: Number(quantity),
      addedBy: req.user.username,
      addedByRole: req.user.role,
      status: req.user.role === 'Owner' ? 'Approved' : 'Pending'
    });

    const savedFruit = await fruit.save();
    res.status(201).json(savedFruit);
  } 
  catch (error) 
  {
    res.status(400).json({ message: error.message });
  }
});

// Update fruit (Manager can update own items, Owner can update any)
router.put('/:id', managerOrOwner, async (req, res) => {
  try 
  {
    const { productName, state, price, remark, quantity } = req.body;
    
    // Find the fruit first
    const existingFruit = await Fruit.findById(req.params.id);

    if (!existingFruit) 
    {
      return res.status(404).json({ message: 'Fruit not found' });
    }
    
    // Manager can only update their own items that are not approved yet
    if (req.user.role === 'Manager') 
    {
      if (existingFruit.addedBy !== req.user.username) 
      {
        return res.status(403).json({ message: 'You can only update your own items' });
      }
      if (existingFruit.status === 'Approved') 
      {
        return res.status(403).json({ message: 'Cannot update approved items' });
      }
    }
    
    const fruit = await Fruit.findByIdAndUpdate(
      req.params.id,
      { 
        productName, 
        state, 
        price: Number(price), 
        remark, 
        quantity: Number(quantity)
      },
      { new: true, runValidators: true }
    );

    res.json(fruit);
  } 
  catch (error) 
  {
    res.status(400).json({ message: error.message });
  }
});

// Delete fruit (Manager can delete own pending items, Owner can delete any)
router.delete('/:id', managerOrOwner, async (req, res) => 
{
  try 
  {
    const existingFruit = await Fruit.findById(req.params.id);
    if (!existingFruit) 
    {
      return res.status(404).json({ message: 'Fruit not found' });
    }
    
    // Manager can only delete their own pending items
    if (req.user.role === 'Manager') 
    {
      if (existingFruit.addedBy !== req.user.username) 
      {
        return res.status(403).json({ message: 'You can only delete your own items' });
      }
      if (existingFruit.status === 'Approved') 
      {
        return res.status(403).json({ message: 'Cannot delete approved items' });
      }
    }
    
    await Fruit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fruit deleted successfully' });
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
});

// Approve fruit (Owner only)
router.put('/:id/approve', ownerOnly, async (req, res) => 
{
  try 
  {
    const fruit = await Fruit.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Approved',
        approvedBy: req.user.username,
        approvedByRole: 'Owner',
        approvalDate: new Date(),
        rejectionReason: null 
      },
      { new: true }
    );

    if (!fruit) 
    {
      return res.status(404).json({ message: 'Fruit not found' });
    }

    res.json({ message: 'Fruit approved successfully', fruit });
  } 
  catch (error) 
  {
    res.status(400).json({ message: error.message });
  }
});

// Reject fruit (Owner only)
router.put('/:id/reject', ownerOnly, async (req, res) => 
  {
  try 
  {
    const { rejectionReason } = req.body;
    
    const fruit = await Fruit.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Rejected',
        rejectionReason: rejectionReason || 'No reason provided',
        approvedBy: req.user.username,
        approvedByRole: 'Owner',
        approvalDate: new Date()
      },
      { new: true }
    );

    if (!fruit) 
    {
      return res.status(404).json({ message: 'Fruit not found' });
    }

    res.json({ message: 'Fruit rejected successfully', fruit });
  } 
  catch (error) 
  {
    res.status(400).json({ message: error.message });
  }
});

// Get dashboard statistics (Role-based)
router.get('/stats', managerOrOwner, async (req, res) => 
{
  try 
  {
    let query = {};
    
    // Manager stats: only their items + approved items
    if (req.user.role === 'Manager') 
    {
      query = 
      {
        $or: [
          { addedBy: req.user.username },
          { status: 'Approved' }
        ]
      };
    }
    // Owner sees all stats
    const totalFruits = await Fruit.countDocuments(query);
    const approvedFruits = await Fruit.countDocuments({ ...query, status: 'Approved' });
    const pendingFruits = await Fruit.countDocuments({ ...query, status: 'Pending' });
    const rejectedFruits = await Fruit.countDocuments({ ...query, status: 'Rejected' });
    
    // Calculate total value for approved items only
    const approvedItems = await Fruit.find({ ...query, status: 'Approved' });

    const totalValue = approvedItems.reduce((sum, fruit) => 
    {
      return sum + (fruit.price * fruit.quantity);
    }, 0);
    
    const totalQuantity = approvedItems.reduce((sum, fruit) => 
    {
      return sum + fruit.quantity;
    }, 0);

    res.json({ totalFruits, approvedFruits, pendingFruits, rejectedFruits, totalValue, totalQuantity, userRole: req.user.role, username: req.user.username });
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
});

// Get pending items (Owner only - for approval dashboard)
router.get('/pending', ownerOnly, async (req, res) => 
{
  try 
  {
    const pendingFruits = await Fruit.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(pendingFruits);
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;