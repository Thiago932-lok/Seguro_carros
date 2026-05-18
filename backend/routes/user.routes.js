const { Router } = require('express');
const user = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();
router.use(authMiddleware);

router.get('/me', user.getProfile);
router.put('/me', user.updateProfile);

module.exports = router;
