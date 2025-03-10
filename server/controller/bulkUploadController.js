const bulkUploadService = require('../services/bulkUploadService');

const uploadContacts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return res.status(400).json({ message: 'Invalid file type. Please upload an Excel file' });
        }

        const contactIds = await bulkUploadService.processBulkUpload(req.file.path);
        res.status(200).json({
            message: 'Contacts processed successfully',
            contactIds
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBulkOperation = async (req, res) => {
    try {
        const { batch, file_name, date, status } = req.body;

        if (!batch || !file_name || !date || !status) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const result = await bulkUploadService.createBulkOperation(batch, file_name, date, 'Completed');
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getAllBulkOperations = async (req, res) => {
    try {
        const data = await bulkUploadService.getAllBulkOperations();

        res.status(200).json({
            success: true,
            message: 'Data fetched successfully',
            data: data,
        });
    } catch (error) {
        console.error('Error fetching data:', error);

        res.status(500).json({
            success: false,
            message: 'Error fetching data',
            error: error.message,
        });
    }
};
module.exports = {
    uploadContacts,
    createBulkOperation,
    getAllBulkOperations
};