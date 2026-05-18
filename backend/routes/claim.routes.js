const { Router } = require('express');
const claim = require('../controllers/claim.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/', claim.list);
router.post(
  '/',
  validateBody(['insuranceId', 'type', 'description', 'incidentDate']),
  claim.create
);

module.exports = router;
