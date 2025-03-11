import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BulkUploads from "./component/bulkUpload";
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          transition={Flip}
        />
        <Routes>
          <Route path="/bulk-uploads" element={<BulkUploads />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
