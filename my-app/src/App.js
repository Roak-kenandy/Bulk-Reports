import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BulkUploads from "./component/bulkUpload";
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/bulk-uploads" element={<BulkUploads />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
