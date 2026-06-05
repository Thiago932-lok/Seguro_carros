const { Router } = require('express');
const payment = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/', payment.list);
router.get('/:id', payment.getOne);
router.post('/:id/pay', payment.pay);

module.exports = router;
