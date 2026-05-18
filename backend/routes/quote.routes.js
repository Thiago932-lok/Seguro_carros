const { Router } = require('express');
const quote = require('../controllers/quote.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/', quote.list);
router.post('/simulate', validateBody(['carId']), quote.simulate);

module.exports = router;
