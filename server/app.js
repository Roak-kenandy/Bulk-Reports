// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const bulkUploadRoutes = require('./routes/bulkUploadRoutes');
// const compression = require('compression');
// const path = require('path');

// const app = express();

// // Enable CORS for all routes
// app.use(cors());

// //Middleware to parse JSON
// app.use(express.json());    //This is a built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on body-parser.

// //Connect to MongoDB Atlas
// connectDB();


// app.use(
//   compression({
//     level: 6,
//     threshold: 100 * 1000,
//     filter: (req, res) => {
//       if (req.headers['x-no-compression']) {
//         return false;
//       }
//       return compression.filter(req, res);
//     }
//   })
// )

// //Define a routes
// app.use('/bulk-uploads', bulkUploadRoutes);

// // Serve static files (React/Angular/Vue build)
// app.use(express.static(path.join(__dirname, 'client/build')));

// // Handle client-side routing
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// //Default route
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// module.exports = app;

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

// Compression middleware (simplified)
app.use(compression({ level: 6 }));

// API Routes
app.use('/bulk-uploads', bulkUploadRoutes);

// Static files path correction (pointing to React build directory)
const buildPath = path.join(__dirname, 'my-app/build');
app.use(express.static(buildPath));

// Client-side routing handler
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling for missing build files
process.on('unhandledRejection', (err) => {
  console.error('Error serving static files:', err);
  if (err.code === 'ENOENT') {
    console.error('Build directory missing! Run npm run build in client directory');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from: ${buildPath}`);
});

module.exports = app;