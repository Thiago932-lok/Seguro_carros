require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const carRoutes = require('./routes/car.routes');
const quoteRoutes = require('./routes/quote.routes');
const insuranceRoutes = require('./routes/insurance.routes');
const paymentRoutes = require('./routes/payment.routes');
const claimRoutes = require('./routes/claim.routes');
const { errorMiddleware } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/insurances', insuranceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/claims', claimRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const file = req.path.endsWith('.html') ? req.path : '/index.html';
  res.sendFile(path.join(frontendPath, file.replace(/^\//, '')), (err) => {
    if (err) res.sendFile(path.join(frontendPath, 'index.html'));
  });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Seguradora rodando em http://localhost:${PORT}`);
});
