const Subscription = require('../models/Subscription');

// Helper to calculate reminder status
const getReminderStatus = (nextBillingDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // normalize today

  const billingDate = new Date(nextBillingDate);
  billingDate.setHours(0, 0, 0, 0); // normalize billing date

  const diffTime = billingDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'overdue';
  } else if (diffDays <= 3) {
    return 'due soon';
  } else {
    return 'upcoming';
  }
};

// @desc    Get all subscriptions for logged-in user
// @route   GET /api/subscriptions
// @access  Private
exports.getSubscriptions = async (req, res) => {
  try {
    const { search, category, status } = req.query;

    let query = { userId: req.user.id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    let subscriptions = await Subscription.find(query).sort({ nextBillingDate: 1 });

    // Inject reminderStatus
    const subsWithReminders = subscriptions.map((sub) => {
      return {
        ...sub.toObject(),
        reminderStatus: getReminderStatus(sub.nextBillingDate)
      };
    });

    res.status(200).json({ success: true, count: subsWithReminders.length, data: subsWithReminders });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Add a subscription
// @route   POST /api/subscriptions
// @access  Private
exports.addSubscription = async (req, res) => {
  try {
    req.body.userId = req.user.id;
    const subscription = await Subscription.create(req.body);
    res.status(201).json({ success: true, data: subscription });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
exports.updateSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    // Make sure user owns subscription
    if (subscription.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this subscription' });
    }

    subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: subscription });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    // Make sure user owns subscription
    if (subscription.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this subscription' });
    }

    await subscription.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Toggle status
// @route   PATCH /api/subscriptions/:id/status
// @access  Private
exports.toggleStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    if (subscription.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    subscription.status = subscription.status === 'active' ? 'inactive' : 'active';
    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get subscription spending summary
// @route   GET /api/subscriptions/summary
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id, status: 'active' });

    let totalMonthly = 0;
    let totalYearly = 0;
    const categorySpending = {};

    subscriptions.forEach((sub) => {
      let monthlyCost = 0;
      let yearlyCost = 0;

      if (sub.billingCycle === 'monthly') {
        monthlyCost = sub.price;
        yearlyCost = sub.price * 12;
      } else if (sub.billingCycle === 'yearly') {
        monthlyCost = sub.price / 12;
        yearlyCost = sub.price;
      }

      totalMonthly += monthlyCost;
      totalYearly += yearlyCost;

      if (!categorySpending[sub.category]) {
        categorySpending[sub.category] = 0;
      }
      categorySpending[sub.category] += monthlyCost;
    });

    res.status(200).json({
      success: true,
      data: {
        totalMonthly: totalMonthly.toFixed(2),
        totalYearly: totalYearly.toFixed(2),
        categorySpending
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
