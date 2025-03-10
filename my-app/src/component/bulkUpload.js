import React, { useState, useRef } from 'react';
import { uploadFile } from '../service/apiService';
const xlsx = require('xlsx');

const BulkUploads = () => {
    const [uploads, setUploads] = useState([]);
    const formatFileInputRef = useRef(null); // Ref for the "Formatting CSV" file input
    const postingFileInputRef = useRef(null); // Ref for the "Posting CSV" file input

    const handleFormatUpload = async () => {
        const file = formatFileInputRef.current?.files?.[0];
        if (file) {
            console.log(file, 'file for formatting');
            try {
                const result = await uploadFile(file);
                console.log('Upload success:', result);

                // const contactMap = {};
                // result.contactIds.forEach(item => {
                //     contactMap[item.contact_code] = item.contact_id;
                // });

                // // 3. Read the original file again
                // const reader = new FileReader();
                // reader.onload = async (e) => {
                //     const data = new Uint8Array(e.target.result);
                //     const workbook = xlsx.read(data, { type: 'array' });
                //     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                //     const jsonData = xlsx.utils.sheet_to_json(worksheet);

                //     // 4. Replace Contact Code values with contact_id
                //     const updatedData = jsonData.map(row => ({
                //         ...row,
                //         'Contact Code': contactMap[row['Contact Code']] || row['Contact Code']
                //     }));

                //     // 5. Create new workbook with updated data
                //     const newWorksheet = xlsx.utils.json_to_sheet(updatedData);
                //     const newWorkbook = xlsx.utils.book_new();
                //     xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');

                //     // 6. Trigger download of modified file
                //     const wbout = xlsx.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
                //     const blob = new Blob([wbout], { type: 'application/octet-stream' });
                //     const link = document.createElement('a');
                //     link.href = window.URL.createObjectURL(blob);
                //     link.download = 'updated_contacts.xlsx';
                //     link.click();
                // };
                // reader.readAsArrayBuffer(file);
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = xlsx.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = xlsx.utils.sheet_to_json(worksheet);

                    // Replace Contact Code values with contact_id while maintaining order
                    const updatedData = jsonData.map((row, index) => ({
                        ...row,
                        'Contact Code': result.contactIds[index]?.contact_id || row['Contact Code']
                    }));

                    // Create and download modified file
                    const newWs = xlsx.utils.json_to_sheet(updatedData);
                    const newWb = xlsx.utils.book_new();
                    xlsx.utils.book_append_sheet(newWb, newWs, 'Contacts');

                    const buffer = xlsx.write(newWb, { type: 'array', bookType: 'xlsx' });
                    const blob = new Blob([buffer], { type: 'application/octet-stream' });
                    const fileName = `updated_contacts_${Date.now()}.xlsx`;

                    // Trigger download
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                reader.readAsArrayBuffer(file);
            } catch (error) {
                console.error('Upload error:', error);
            } finally {
                formatFileInputRef.current.value = ''; // Reset input
            }
        }
    };

    // const handlePostingUpload = () => {
    //     const file = postingFileInputRef.current?.files?.[0];
    //     if (file) {

    //         const newRecord = {
    //             batch: `BATCH${Date.now().toString().slice(-4)}`,
    //             filename: file.name,
    //             date: new Date().toLocaleDateString('en-GB'),
    //             status: 'running'
    //         };

    //         setUploads([...uploads, newRecord]);

    //         setTimeout(() => {
    //             setUploads(prev => prev.map(rec =>
    //                 rec.batch === newRecord.batch ? { ...rec, status: 'completed' } : rec
    //             ));
    //             postingFileInputRef.current.value = '';
    //         }, 3000);
    //     }
    // };

    const handlePostingUpload = async () => {
        const file = postingFileInputRef.current?.files?.[0];
        if (!file) return;

        try {
            // 1. Read Excel file
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = xlsx.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = xlsx.utils.sheet_to_json(worksheet);

                // 2. Process each row as a separate payload
                jsonData.forEach(async (row) => {
                    try {
                        // 3. Create payload from Excel row data
                        const payload = {
                            id: row['Contact Code'], // Use Contact Code as ID
                            action: row.action || 'DEBIT', // Default to DEBIT if not specified
                            entity: row.entity || 'ACCOUNT', // Default to ACCOUNT
                            amount: parseFloat(row.amount) || 0,
                            currency_code: row.currency_code || 'MVR',
                            notes: row.notes || '',
                        };

                        console.log(payload, 'apyload comes along')

                        // 4. POST to the API endpoint
                        const response = await fetch(
                            `https://app.crm.com/backoffice/v2/contacts/${payload.id}/journals`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'api_key': 'c54504d4-0fbe-41cc-a11e-822710db9b8d',
                                },
                                body: JSON.stringify(payload),
                            }
                        );

                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                        const result = await response.json();
                        console.log('Post successful:', result);

                        if (response.status) {
                            const newRecord = {
                                batch: `BATCH${Date.now().toString().slice(-4)}`,
                                file_name: file.name,
                                date: new Date().toLocaleDateString('en-GB'),
                                status: 'running'
                            };

                            setUploads([...uploads, newRecord]);


                            setTimeout(() => {
                                setUploads(prev => prev.map(rec =>
                                    rec.batch === newRecord.batch ? { ...rec, status: 'completed' } : rec
                                ));
                                postingFileInputRef.current.value = '';
                            }, 3000);

                        }
                    } catch (error) {
                        console.error('Error processing row:', error);
                    }
                });
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('File processing error:', error);
        } finally {
            postingFileInputRef.current.value = '';
        }
    };

    const StatusBadge = ({ status }) => (
        <span className={`status-badge ${status}`}>
            {status === 'running' ? (
                <>
                    <svg className="spinner" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                    Processing
                </>
            ) : (
                <>
                    <svg className="checkmark" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Completed
                </>
            )}
        </span>
    );

    return (
        <div className="bulk-uploads-container">
            <div className="upload-header">
                <h2>Bulk Operations</h2>
                <div className="button-group">
                    {/* Formatting CSV Button */}
                    <button className="upload-button primary" onClick={() => formatFileInputRef.current.click()}>
                        <svg viewBox="0 0 24 24" className="icon">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                        </svg>
                        Formatting CSV
                    </button>
                    <input
                        type="file"
                        ref={formatFileInputRef}
                        hidden
                        onChange={handleFormatUpload}
                    />

                    {/* Posting CSV Button */}
                    <button className="upload-button secondary" onClick={() => postingFileInputRef.current.click()}>
                        <svg viewBox="0 0 24 24" className="icon">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Posting CSV
                    </button>
                    <input
                        type="file"
                        ref={postingFileInputRef}
                        hidden
                        onChange={handlePostingUpload}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="uploads-table">
                    <thead>
                        <tr>
                            <th>Batch #</th>
                            <th>Filename</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uploads.map((upload) => (
                            <tr key={upload.batch}>
                                <td data-label="Batch #">{upload.batch}</td>
                                <td data-label="Filename">{upload.file_name}</td>
                                <td data-label="Date">{upload.date}</td>
                                <td data-label="Status">
                                    <StatusBadge status={upload.status} />
                                </td>
                                <td data-label="Actions">
                                    <button className="view-button">
                                        <svg viewBox="0 0 24 24" className="icon">
                                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                        </svg>
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        :root {
          --primary: #4361ee;
          --secondary: #3f37c9;
          --light: #f8f9fa;
          --dark: #212529;
          --success: #4cc9f0;
          --warning: #ffd60a;
        }

        .bulk-uploads-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .upload-header {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .button-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .upload-button {
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          border: 2px solid transparent;
        }

        .upload-button.primary {
          background-color: var(--primary);
          color: white;
        }

        .upload-button.primary:hover {
          background-color: var(--secondary);
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(67, 97, 238, 0.3);
        }

        .upload-button.secondary {
          background-color: white;
          color: var(--primary);
          border-color: var(--primary);
        }

        .upload-button.secondary:hover {
          background-color: var(--light);
          transform: translateY(-2px);
        }

        .icon {
          width: 1.2rem;
          height: 1.2rem;
          fill: currentColor;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .uploads-table {
          width: 100%;
          border-collapse: collapse;
        }

        .uploads-table th,
        .uploads-table td {
          padding: 1.2rem;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }

        .uploads-table th {
          background-color: var(--light);
          font-weight: 600;
          color: var(--dark);
        }

        .uploads-table tbody tr:last-child td {
          border-bottom: none;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9em;
        }

        .status-badge.running {
          background-color: rgba(255, 214, 10, 0.1);
          color: #ffb700;
        }

        .status-badge.completed {
          background-color: rgba(76, 201, 240, 0.1);
          color: #4cc9f0;
        }

        .spinner {
          animation: rotate 2s linear infinite;
          width: 1.2rem;
          height: 1.2rem;
        }

        .spinner .path {
          stroke: currentColor;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }

        .checkmark {
          width: 1.2rem;
          height: 1.2rem;
          fill: currentColor;
        }

        .view-button {
          background: none;
          border: 2px solid #e9ecef;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--dark);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .view-button:hover {
          background-color: var(--light);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .bulk-uploads-container {
            padding: 1rem;
          }

          .uploads-table thead {
            display: none;
          }

          .uploads-table tr {
            display: block;
            padding: 1rem;
            border-bottom: 2px solid #e9ecef;
          }

          .uploads-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            border-bottom: none;
          }

          .uploads-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: var(--dark);
            margin-right: 1rem;
          }

          .upload-header {
            flex-direction: column;
            align-items: stretch;
          }

          .button-group {
            flex-direction: column;
          }
        }

        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }

        @keyframes dash {
          0% { stroke-dasharray: 1,150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90,150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90,150; stroke-dashoffset: -124; }
        }
      `}</style>
        </div>
    );
};

export default BulkUploads;