const { Router } = require('express');
const auth = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validate.middleware');

const router = Router();

router.post('/register', validateBody(['name', 'cpf', 'email', 'password']), auth.register);
router.post('/login', validateBody(['email', 'password']), auth.login);
router.post('/logout', auth.logout);

module.exports = router;
