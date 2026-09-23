const { pool } = require('../config/db');

async function getTicket(ticketId) {
  const [rows] = await pool.query(
    'SELECT id, user_id FROM tickets WHERE id = ?',
    [ticketId]
  );
  return rows[0];
}

exports.getComments = async (req, res, next) => {
  try {
    const ticket = await getTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (req.user.role === 'CUSTOMER' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [rows] = await pool.query(`
      SELECT c.id, c.ticket_id, c.user_id, c.comment, c.created_at,
             u.name AS user_name, u.role AS user_role
      FROM ticket_comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.ticket_id = ?
      ORDER BY c.created_at ASC
    `, [req.params.id]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const ticket = await getTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (req.user.role === 'CUSTOMER' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [result] = await pool.query(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, comment.trim()]
    );

    const [rows] = await pool.query(`
      SELECT c.id, c.ticket_id, c.user_id, c.comment, c.created_at,
             u.name AS user_name, u.role AS user_role
      FROM ticket_comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};
