const { Router } = require('express');
const car = require('../controllers/car.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');

const router = Router();

router.get('/fipe/brands', car.getFipeBrands);
router.get('/fipe/brands/:brandCode/models', car.getFipeModels);
router.get('/fipe/brands/:brandCode/models/:modelCode/years', car.getFipeYears);
router.get('/fipe/brands/:brandCode/models/:modelCode/years/:yearCode/price', car.getFipePrice);

router.use(authMiddleware);
router.get('/', car.list);
router.post(
  '/',
  validateBody(['brand', 'model', 'year', 'plate']),
  car.create
);

module.exports = router;
