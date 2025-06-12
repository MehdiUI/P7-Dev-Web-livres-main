/* eslint-disable import/newline-after-import */
/* eslint-disable eol-last */
const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const auth = require('../middleware/auth');
const { upload, optimizeImage } = require('../middleware/multer-config');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, upload, optimizeImage, bookCtrl.createBook);
router.put('/:id', auth, upload, optimizeImage, bookCtrl.modifyBook);

router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;
