import express from 'express';
import { createCheckoutSession, handleWebhook, mockUpgrade, createRazorpayOrder } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeWorkspace } from '../middleware/rbacMiddleware.js';
const router = express.Router();
router.post('/create-checkout-session', protect, authorizeWorkspace(['owner']), createCheckoutSession);
router.post('/create-razorpay-order', protect, authorizeWorkspace(['owner']), createRazorpayOrder);
router.post('/mock-upgrade', protect, authorizeWorkspace(['owner']), mockUpgrade);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
export default router;
//# sourceMappingURL=subscriptionRoutes.js.map