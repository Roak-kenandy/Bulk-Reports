import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BulkUploads from "./component/bulkUpload";
import LoginReports from "./component/login";
import ResetPassword from "./component/resetPassword";
import ProtectedRoute from "./component/protectedRoute";
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <Router basename="/bulk-uploads">
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
          <Route path="/login" element={<LoginReports />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
          <Route path="/operations" element={<BulkUploads />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
