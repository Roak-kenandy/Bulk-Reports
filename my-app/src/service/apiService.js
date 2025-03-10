import axios from 'axios';

const baseUrl = 'http://localhost:5000';

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

export { uploadFile };