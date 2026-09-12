import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { DepartmentDashboard } from './pages/department/DepartmentDashboard.js';
import { DepartmentQueuePage } from './pages/department/DepartmentQueuePage.js';
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
          <Route path="live-map" element={<AllComplaintsPage />} />
          <Route path="departments" element={<AllComplaintsPage />} />
          <Route path="escalations" element={<AllComplaintsPage />} />
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
          <Route path="staff" element={<DepartmentDashboard />} />
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
          <Route path="history" element={<FieldDashboard />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
