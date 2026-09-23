const { pool } = require('../config/db');

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function validateEnum(value, allowed) {
  return !value || allowed.includes(value);
}

exports.getTickets = async (req, res, next) => {
  try {
    const { search = '', status, priority, assigned_to, sort = 'newest' } = req.query;
    const params = [];
    const where = [];

    if (req.user.role === 'CUSTOMER') {
      where.push('t.user_id = ?');
      params.push(req.user.id);
    }

    if (search.trim()) {
      where.push('(t.subject LIKE ? OR t.description LIKE ?)');
      const q = `%${search.trim()}%`;
      params.push(q, q);
    }

    if (status) {
      if (!statuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });
      where.push('t.status = ?');
      params.push(status);
    }

    if (priority) {
      if (!priorities.includes(priority)) return res.status(400).json({ message: 'Invalid priority' });
      where.push('t.priority = ?');
      params.push(priority);
    }

    if (req.user.role === 'AGENT' && assigned_to) {
      where.push('t.assigned_to = ?');
      params.push(Number(assigned_to));
    }

    const orderMap = {
      newest: 't.created_at DESC',
      oldest: 't.created_at ASC',
      updated: 't.updated_at DESC',
      priority: `FIELD(t.priority, 'URGENT', 'HIGH', 'MEDIUM', 'LOW'), t.created_at DESC`
    };

    const orderBy = orderMap[sort] || orderMap.newest;
    const sql = `
      SELECT
        t.id, t.user_id, t.subject, t.description, t.priority, t.status,
        t.assigned_to, t.created_at, t.updated_at,
        customer.name AS customer_name,
        customer.email AS customer_email,
        agent.name AS agent_name
      FROM tickets t
      JOIN users customer ON customer.id = t.user_id
      LEFT JOIN users agent ON agent.id = t.assigned_to
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    const { subject, description, priority = 'MEDIUM' } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }
    if (!validateEnum(priority, priorities)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const [result] = await pool.query(
      'INSERT INTO tickets (user_id, subject, description, priority) VALUES (?, ?, ?, ?)',
      [req.user.id, subject.trim(), description.trim(), priority]
    );

    const [rows] = await pool.query(`
      SELECT t.*, customer.name AS customer_name, customer.email AS customer_email
      FROM tickets t
      JOIN users customer ON customer.id = t.user_id
      WHERE t.id = ?
    `, [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

async function findTicket(id) {
  const [rows] = await pool.query(`
    SELECT
      t.id, t.user_id, t.subject, t.description, t.priority, t.status,
      t.assigned_to, t.created_at, t.updated_at,
      customer.name AS customer_name,
      customer.email AS customer_email,
      agent.name AS agent_name
    FROM tickets t
    JOIN users customer ON customer.id = t.user_id
    LEFT JOIN users agent ON agent.id = t.assigned_to
    WHERE t.id = ?
  `, [id]);
  return rows[0];
}

function canAccess(ticket, user) {
  return user.role === 'AGENT' || ticket.user_id === user.id;
}

exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await findTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (!canAccess(ticket, req.user)) return res.status(403).json({ message: 'Forbidden' });
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

exports.updateTicket = async (req, res, next) => {
  try {
    const ticket = await findTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const { status, priority, assigned_to } = req.body;

    if (req.user.role === 'CUSTOMER') {
      if (ticket.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const allowedCustomerFields = ['status'];
      const requestedKeys = Object.keys(req.body);
      if (requestedKeys.some(k => !allowedCustomerFields.includes(k))) {
        return res.status(403).json({ message: 'Customers cannot modify this ticket field' });
      }
      if (status && !['OPEN', 'CLOSED'].includes(status)) {
        return res.status(403).json({ message: 'Customers may only open or close their ticket' });
      }
    }

    if (status && !statuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (priority && !priorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    let agentId = assigned_to;
    if (assigned_to !== undefined && assigned_to !== null && assigned_to !== '') {
      agentId = Number(assigned_to);
      const [agents] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND role = 'AGENT'",
        [agentId]
      );
      if (!agents.length) return res.status(400).json({ message: 'Assigned user must be an agent' });
    } else if (assigned_to === null || assigned_to === '') {
      agentId = null;
    }

    const fields = [];
    const values = [];

    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (priority !== undefined) {
      fields.push('priority = ?');
      values.push(priority);
    }
    if (assigned_to !== undefined && req.user.role === 'AGENT') {
      fields.push('assigned_to = ?');
      values.push(agentId);
    }

    if (!fields.length) return res.status(400).json({ message: 'No valid fields supplied' });

    values.push(req.params.id);
    await pool.query(`UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json(await findTicket(req.params.id));
  } catch (err) {
    next(err);
  }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await findTicket(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (req.user.role !== 'AGENT' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    next(err);
  }
};
