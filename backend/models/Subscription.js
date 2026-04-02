const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a subscription name']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: [true, 'Please specify billing cycle']
  },
  nextBillingDate: {
    type: Date,
    required: [true, 'Please add the next billing date']
  },
  category: {
    type: String,
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
