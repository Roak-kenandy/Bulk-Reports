const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bulkUploadRoutes = require('./routes/bulkUploadRoutes');
const compression = require('compression');
const path = require('path');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Compression middleware
app.use(
  compression({
    level: 6,
    threshold: 100 * 1000,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  })
);

// API Routes (must come before static files)
app.use('/bulk-uploads', bulkUploadRoutes);

// Static files configuration (for React build)
const buildPath = path.join(__dirname, '../../my-app/build'); // Adjusted path
app.use(express.static(buildPath));

// Client-side routing handler (must be after static files)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Remove the default route if not needed
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;