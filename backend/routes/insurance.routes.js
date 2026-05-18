const { Router } = require('express');
const insurance = require('../controllers/insurance.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/', insurance.list);
router.get('/preview', insurance.preview);
router.post('/contract', validateBody(['quoteId']), insurance.contract);

module.exports = router;
