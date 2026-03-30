import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Pricing from './pages/Pricing';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Settings from './pages/Settings';
import MockCheckout from './pages/MockCheckout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/editor/:id" 
            element={
              <PrivateRoute>
                <Editor />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/pricing" 
            element={
              <PrivateRoute>
                <Pricing />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/success" 
            element={
              <PrivateRoute>
                <Success />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/cancel" 
            element={
              <PrivateRoute>
                <Cancel />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/mock-checkout" 
            element={
              <PrivateRoute>
                <MockCheckout />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
