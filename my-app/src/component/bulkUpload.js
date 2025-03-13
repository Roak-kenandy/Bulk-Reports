import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, Description, CheckCircle, Autorenew } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { uploadFile, createOperationRecord, getAllBulkOperations } from '../service/apiService';
const xlsx = require('xlsx');

const BulkUploads = () => {
  const [uploads, setUploads] = useState([]);
  const formatFileInputRef = useRef(null);
  const postingFileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getAllBulkOperations(currentPage, itemsPerPage);
      setUploads(result.data.reports);
      setTotalPages(result.data.totalPages);
      setTotalRecords(result.data.totalRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  const handleFormatUpload = async () => {
    const file = formatFileInputRef.current?.files?.[0];
    if (file) {
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

          if (jsonData.length > 100) {
            toast.error('Excel file cannot contain more than 100 entries');
            postingFileInputRef.current.value = '';
            return;
          }

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

          toast.success('File downloaded successfully!');
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('An error occurred during the file upload!');
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
        if (jsonData.length > 100) {
          toast.error('Excel file cannot contain more than 100 entries');
          postingFileInputRef.current.value = '';
          return;
        }

        // 2. Process each row as a separate payload
        jsonData.forEach(async (row) => {
          try {
            // 3. Create payload from Excel row data
            const payload = {
              id: row['Contact Code'], // Use Contact Code as ID
              action: row.Action || 'DEBIT', // Default to DEBIT if not specified
              entity: row.Entity || 'ACCOUNT', // Default to ACCOUNT
              amount: parseFloat(row.Amount) || 0,
              currency_code: row['Currency Code'] || 'MVR',
              notes: row['Notes'] || '',
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
              toast.success('Excel file uploaded successfully');
              const newRecord = {
                batch: `BATCH${Date.now().toString().slice(-4)}`,
                file_name: file.name,
                date: Math.floor(Date.now() / 1000),
                status: 'running'
              };

              const result = await createOperationRecord(newRecord);
              console.log('createOperationRecord', result);
              fetchData()


              setUploads([...uploads, newRecord]);


              setTimeout(() => {
                setUploads(prev => prev.map(rec =>
                  rec.batch === newRecord.batch ? { ...rec, status: 'completed' } : rec
                ));
                postingFileInputRef.current.value = '';
              }, 3000);

            }
            else {
              toast.error('Failed to upload Excel file');
            }
            console.log(uploads, 'uploads data')
          } catch (error) {
            console.error('Error processing row:', error);
            toast.error('An error occurred during file processing!');
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

  const MotionButton = motion(Button);
  const MotionTableRow = motion(TableRow);

  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const formatDate = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        padding: '2rem',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 100%)',
        fontFamily: 'Poppins, sans-serif',
        color: '#fff',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'rgba(13, 27, 42, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}
        >
          <Typography variant="h4" sx={{ 
            fontWeight: '700', 
            color: '#C8B560',
            textShadow: '0 0 10px rgba(200, 181, 96, 0.5)'
          }}>
            Bulk Operations
          </Typography>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <MotionButton
              component="label"
              variant="contained"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<CloudUpload />}
              sx={{
                bgcolor: '#C8B560',
                color: '#0D1B2A',
                fontWeight: '700',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(200, 181, 96, 0.3)',
                '&:hover': { bgcolor: '#d6c879' }
              }}
            >
              Format CSV
              <input
                type="file"
                hidden
                ref={formatFileInputRef}
                onChange={handleFormatUpload}
              />
            </MotionButton>

            <MotionButton
              component="label"
              variant="outlined"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              startIcon={<Description />}
              sx={{
                borderColor: '#C8B560',
                color: '#C8B560',
                fontWeight: '700',
                borderRadius: '12px',
                '&:hover': { borderColor: '#d6c879' }
              }}
            >
              Post CSV
              <input
                type="file"
                hidden
                ref={postingFileInputRef}
                onChange={handlePostingUpload}
              />
            </MotionButton>
          </div>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <TableContainer sx={{
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          maxHeight: 'calc(50vh - 30px)',
          minHeight: 'calc(50vh - 30px)',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#C8B560',
            borderRadius: '4px',
          },
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  {['Batch #', 'Filename', 'Date', 'Status'].map((header) => (
                    <TableCell key={header} sx={{
                      fontWeight: '700',
                      color: '#C8B560',
                      borderColor: 'rgba(200, 181, 96, 0.3)',
                      position: 'sticky',
                      top: 0,
                      background: `
                        linear-gradient(
                          rgba(13, 27, 42, 0.98),
                          rgba(13, 27, 42, 0.98)
                        ),
                        rgba(255, 255, 255, 0.1)
                      `,
                      backdropFilter: 'blur(12px)',
                      zIndex: 3, // Increased z-index
                      borderBottom: '2px solid rgba(200, 181, 96, 0.5)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                <AnimatePresence>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          py: 4
                        }}>
                          <CircularProgress sx={{ color: '#C8B560' }} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    uploads.map((upload) => (
                      <MotionTableRow
                        key={upload.batch}
                        variants={tableVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.3 }}
                        hover
                        sx={{
                          '&:hover': {
                            background: 'rgba(200, 181, 96, 0.05)'
                          }
                        }}
                      >
                        <TableCell sx={{ color: '#fff' }}>{upload.batch}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{upload.file_name}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{formatDate(upload.date)}</TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: upload.status === 'completed' ? '#4cc9f0' : '#C8B560'
                          }}>
                            {upload.status === 'running' ? (
                              <Autorenew sx={{ 
                                animation: 'spin 2s linear infinite',
                                '@keyframes spin': {
                                  '0%': { transform: 'rotate(0deg)' },
                                  '100%': { transform: 'rotate(360deg)' }
                                }
                              }} />
                            ) : (
                              <CheckCircle />
                            )}
                            {upload.status}
                          </Box>
                        </TableCell>
                      </MotionTableRow>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        {/* Pagination Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <Typography variant="body2" sx={{ color: '#ffffffaa' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} - 
            {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords}
          </Typography>

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#fff',
                '&.Mui-selected': {
                  background: '#C8B560 !important',
                  boxShadow: '0 0 8px rgba(200, 181, 96, 0.5)'
                },
                '&:hover': {
                  background: 'rgba(200, 181, 96, 0.1)'
                }
              }
            }}
          />

          <Select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            sx={{
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#C8B560 !important',
              },
              '& .MuiSvgIcon-root': {
                color: '#C8B560'
              }
            }}
          >
            <MenuItem value={10}>10 per page</MenuItem>
            <MenuItem value={25}>25 per page</MenuItem>
            <MenuItem value={50}>50 per page</MenuItem>
          </Select>
        </motion.div>
      </motion.div>
    </div>
  );
};


export default BulkUploads;