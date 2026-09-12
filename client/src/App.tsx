import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { UserRoles } from '@bmc/shared';

// Layouts
import { CitizenLayout } from './components/layout/CitizenLayout.js';
import { AdminLayout } from './components/layout/AdminLayout.js';
import { DeptLayout } from './components/layout/DeptLayout.js';
import { FieldLayout } from './components/layout/FieldLayout.js';

// Pages
import { LoginPage } from './pages/auth/LoginPage.js';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard.js';
import { ReportIssuePage } from './pages/citizen/ReportIssuePage.js';
import { MyComplaintsPage } from './pages/citizen/MyComplaintsPage.js';
import { TicketDetailPage } from './pages/citizen/TicketDetailPage.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AllComplaintsPage } from './pages/admin/AllComplaintsPage.js';
import { LiveGISMapPage } from './pages/admin/LiveGISMapPage.js';
import { DepartmentManagementPage } from './pages/admin/DepartmentManagementPage.js';
import { EscalationCenterPage } from './pages/admin/EscalationCenterPage.js';
import { DepartmentDashboard } from './pages/department/DepartmentDashboard.js';
import { DepartmentQueuePage } from './pages/department/DepartmentQueuePage.js';
import { StaffManagementPage } from './pages/department/StaffManagementPage.js';
import { FieldDashboard } from './pages/field/FieldDashboard.js';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on actual user role
    if (user.role === UserRoles.BMC_ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === UserRoles.DEPT_OFFICER || user.role === UserRoles.DEPT_SUPERVISOR)
      return <Navigate to="/dept" replace />;
    if (user.role === UserRoles.FIELD_STAFF) return <Navigate to="/field" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return <>{children}</>;
};

// Smart Ticket Redirect based on active user role
const SmartTicketRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === UserRoles.BMC_ADMIN) {
    return <Navigate to={`/admin/ticket/${id}`} replace />;
  }
  if (user.role === UserRoles.DEPT_OFFICER || user.role === UserRoles.DEPT_SUPERVISOR) {
    return <Navigate to={`/dept/ticket/${id}`} replace />;
  }
  if (user.role === UserRoles.FIELD_STAFF) {
    return <Navigate to={`/field/ticket/${id}`} replace />;
  }
  return <Navigate to={`/citizen/ticket/${id}`} replace />;
};

export const App: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Root Redirect based on user state */}
        <Route
          path="/"
          element={
            !isAuthenticated || !user ? (
              <Navigate to="/login" replace />
            ) : user.role === UserRoles.BMC_ADMIN ? (
              <Navigate to="/admin" replace />
            ) : user.role === UserRoles.DEPT_OFFICER || user.role === UserRoles.DEPT_SUPERVISOR ? (
              <Navigate to="/dept" replace />
            ) : user.role === UserRoles.FIELD_STAFF ? (
              <Navigate to="/field" replace />
            ) : (
              <Navigate to="/citizen" replace />
            )
          }
        />

        {/* Global Smart Ticket / Complaint Redirectors */}
        <Route path="/ticket/:id" element={<SmartTicketRedirect />} />
        <Route path="/complaints/:id" element={<SmartTicketRedirect />} />

        {/* 1. Citizen Portal Routes */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute allowedRoles={[UserRoles.CITIZEN, UserRoles.BMC_ADMIN]}>
              <CitizenLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CitizenDashboard />} />
          <Route path="report" element={<ReportIssuePage />} />
          <Route path="my-complaints" element={<MyComplaintsPage />} />
          <Route path="ticket/:id" element={<TicketDetailPage />} />
        </Route>

        {/* 2. BMC Admin Command Center Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[UserRoles.BMC_ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="complaints" element={<AllComplaintsPage />} />
          <Route path="ticket/:id" element={<TicketDetailPage />} />
          <Route path="live-map" element={<LiveGISMapPage />} />
          <Route path="departments" element={<DepartmentManagementPage />} />
          <Route path="escalations" element={<EscalationCenterPage />} />
        </Route>

        {/* 3. Department Portal Routes */}
        <Route
          path="/dept"
          element={
            <ProtectedRoute
              allowedRoles={[UserRoles.DEPT_OFFICER, UserRoles.DEPT_SUPERVISOR, UserRoles.BMC_ADMIN]}
            >
              <DeptLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DepartmentDashboard />} />
          <Route path="queue" element={<DepartmentQueuePage />} />
          <Route path="ticket/:id" element={<TicketDetailPage />} />
          <Route path="staff" element={<StaffManagementPage />} />
        </Route>

        {/* 4. Field Staff Mobile App Routes */}
        <Route
          path="/field"
          element={
            <ProtectedRoute allowedRoles={[UserRoles.FIELD_STAFF, UserRoles.BMC_ADMIN]}>
              <FieldLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<FieldDashboard />} />
          <Route path="ticket/:id" element={<TicketDetailPage />} />
          <Route path="history" element={<FieldDashboard />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
