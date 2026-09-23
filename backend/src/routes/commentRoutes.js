const router = require('express').Router();
const authenticate = require('../middleware/authMiddleware');
const { getComments, addComment } = require('../controllers/commentController');

router.use(authenticate);
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);

module.exports = router;
