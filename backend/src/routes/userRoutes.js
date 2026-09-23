const router = require('express').Router();
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { getAgents } = require('../controllers/userController');

router.use(authenticate, authorizeRoles('AGENT'));
router.get('/', getAgents);

module.exports = router;
