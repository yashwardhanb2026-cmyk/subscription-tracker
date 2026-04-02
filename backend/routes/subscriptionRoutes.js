const express = require('express');
const {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  toggleStatus,
  getSummary
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/summary').get(getSummary);

router
  .route('/')
  .get(getSubscriptions)
  .post(addSubscription);

router
  .route('/:id')
  .put(updateSubscription)
  .delete(deleteSubscription);

router.patch('/:id/status', toggleStatus);

module.exports = router;
