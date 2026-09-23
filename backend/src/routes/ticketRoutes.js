const router = require('express').Router();
const authenticate = require('../middleware/authMiddleware');
const {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');

router.use(authenticate);
router.get('/', getTickets);
router.post('/', (req, res, next) => {
  if (req.user.role !== 'CUSTOMER') {
    return res.status(403).json({ message: 'Only customers can create tickets' });
  }
  next();
}, createTicket);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

module.exports = router;
