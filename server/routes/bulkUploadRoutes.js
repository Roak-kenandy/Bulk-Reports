const express = require('express');
const router = express.Router();
const multer = require('multer');
const bulkUploadController = require('../controller/bulkUploadController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload-contacts', upload.single('file'), bulkUploadController.uploadContacts);

router.post('/create-bulk', bulkUploadController.createBulkOperation);

router.get('/get-bulk', bulkUploadController.getAllBulkOperations);

module.exports = router;