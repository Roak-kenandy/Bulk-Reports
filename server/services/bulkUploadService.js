const xlsx = require('xlsx');
const mongoose = require('mongoose');

const processBulkUpload = async (filePath) => {
    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Extract contact codes
    const contactCodes = data.map(row => row['Contact Code']).filter(Boolean);

    // Get native collection reference
    const collection = mongoose.connection.db.collection('Journals');

    // Find contacts
    const contacts = await collection.find(
        { contact_code: { $in: contactCodes } },
        { projection: { contact_id: 1,contact_code: 1, _id: 0 } }
    ).toArray();

    // Return array of objects with contact_id property
    return contacts.map(contact => ({ contact_id: contact.contact_id, contact_code: contact.contact_code }));
};

module.exports = {
    processBulkUpload
};