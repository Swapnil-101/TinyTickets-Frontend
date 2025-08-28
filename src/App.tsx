
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/CreateProject';
import { ProjectDetail } from './pages/ProjectDetail';
import { ProjectMembers } from './pages/ProjectMembers';
import { ProjectTickets } from './pages/ProjectTickets';
import { CreateTicket } from './pages/CreateTicket';
import { TicketDetail } from './pages/TicketDetail';
import { Tickets } from './pages/Tickets';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          <Route path="/" element={
              <Login />
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <MainLayout>
                <Projects />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/projects/create" element={
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <MainLayout>
                <ProjectDetail />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/members" element={
            <ProtectedRoute>
              <MainLayout>
                <ProjectMembers />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/tickets" element={
            <ProtectedRoute>
              <MainLayout>
                <ProjectTickets />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/tickets/create" element={
            <ProtectedRoute>
              <CreateTicket />
            </ProtectedRoute>
          } />
          <Route path="/tickets/:id" element={
            <ProtectedRoute>
              <MainLayout>
                <TicketDetail />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/tickets" element={
            <ProtectedRoute>
              <MainLayout>
                <Tickets />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={
            <MainLayout>
              <div className="text-center py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <a
                  href="/"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Go Home
                </a>
              </div>
            </MainLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
