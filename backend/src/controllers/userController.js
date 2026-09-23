const { pool } = require('../config/db');

exports.getAgents = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'AGENT' ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
