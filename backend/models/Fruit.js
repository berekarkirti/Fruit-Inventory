const mongoose = require('mongoose');

const fruitSchema = new mongoose.Schema({
  productName: 
  {
    type: String,
    required: true
  },
  state: 
  {
    type: String,
    required: true
  },
  price: 
  {
    type: Number,
    required: true,
    min: 0
  },
  remark: 
  {
    type: String,
    enum: ['Available', 'In Transit', 'Not Available'],
    default: 'Available'
  },
  quantity: 
  {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // ROLE-BASED FIELDS
  status: 
  {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  addedBy: 
  {
    type: String,
    required: true,
    default: 'Manager'
  },
  addedByRole: 
  {
    type: String,
    enum: ['Manager', 'Owner'],
    required: true,
    default: 'Manager'
  },
  approvedBy: 
  {
    type: String,
    default: null
  },
  approvedByRole: 
  {
    type: String,
    enum: ['Owner'],
    default: null
  },
  approvalDate: 
  {
    type: Date,
    default: null
  },
  rejectionReason: 
  {
    type: String,
    default: null
  }
}, 
{
  timestamps: true
});

module.exports = mongoose.model('Fruit', fruitSchema);