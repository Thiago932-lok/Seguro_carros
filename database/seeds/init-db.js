require('dotenv').config({ path: require('path').join(__dirname, '../../backend/.env') });
require('../../backend/config/db');
console.log('Banco inicializado com migrations.');
