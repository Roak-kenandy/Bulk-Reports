import axios from 'axios';

const baseUrl = 'https://mdnrpt.medianet.mv';

const uploadFile = async (file) => {
    const formData = new FormData();

    try {
        // Append the file to FormData with the correct field name
        formData.append('file', file);

        const response = await axios.post(
            `${baseUrl}/bulk-uploads/upload-contacts`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        console.log('Upload successful:', response.data);
        return response.data;

    } catch (error) {
        console.error('Upload failed:', error.response?.data || error.message);
        throw error;
    }
};

const createOperationRecord = async (file) => {

    try {

        const response = await axios.post(
            `${baseUrl}/bulk-uploads/create-bulk`,
            file,
        );

        console.log('Upload successful:', response.data);
        return response.data;

    } catch (error) {
        console.error('Upload failed:', error.response?.data || error.message);
        throw error;
    }
};

const getAllBulkOperations = async (page, limit) => {

    try {

        const response = await axios.get(
            `${baseUrl}/bulk-uploads/get-bulk`,{
                params: { page, limit }
            }
        );
        return response.data;

    } catch (error) {
        console.error('Failed to fetch datas:', error.response?.data || error.message);
        throw error;
    }
};

export { uploadFile, createOperationRecord, getAllBulkOperations };