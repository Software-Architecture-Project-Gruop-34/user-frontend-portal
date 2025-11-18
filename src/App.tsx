import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Stalls from './pages/Stalls';
import StallProfile from './pages/StallProfile';
import Layout from './layouts/Layout';

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />
        <Route path="/admin/dashboard" element={
          <Layout>
            <AdminDashboard />
          </Layout> 
        }/>
        
        <Route path="/dashboard" element={
          <Layout>
            <UserDashboard />
          </Layout>
        } />
        <Route path="/" element={<Login />} />
      </Routes>
      <Routes>
        <Route path="/stalls" element={
          <Layout>
            <Stalls />
          </Layout>
        } />
      </Routes>

      <Routes>
        <Route path="/stalls/:id" element={
          <Layout>
            <StallProfile />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
