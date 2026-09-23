require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = Number(process.env.PORT || 5000);

async function start() {
  try {
    await testConnection();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Support Ticket API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

start();
