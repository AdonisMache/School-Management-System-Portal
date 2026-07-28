import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/auth/Login';
import { Unauthorized } from '../pages/auth/Unauthorized';
import { Dashboard } from '../pages/dashboards/Dashboard';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ForceChangePassword } from '../pages/auth/ForceChangePassword';

// Import fully functional sub-pages
import { AcademicSetup } from '../pages/academics/AcademicSetup';
import { StudentDirectory } from '../pages/students/StudentDirectory';
import { TeacherDirectory } from '../pages/teachers/TeacherDirectory';
import { AttendanceSystem } from '../pages/attendance/AttendanceSystem';
import { GradesSystem } from '../pages/exams/GradesSystem';
import { FinanceSystem } from '../pages/finance/FinanceSystem';
import { AssignmentsSystem } from '../pages/assignments/AssignmentsSystem';
import { LibrarySystem } from '../pages/library/LibrarySystem';
import { AnnouncementsBoard } from '../pages/communication/AnnouncementsBoard';
import { AuditLogs } from '../pages/audit/AuditLogs';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Standalone Protected Pages */}
      <Route 
        path="/force-change-password" 
        element={
          <ProtectedRoute>
            <ForceChangePassword />
          </ProtectedRoute>
        } 
      />

      {/* Protected Layout Area */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route 
          path="academics" 
          element={
            <ProtectedRoute requiredPermission="academics:write">
              <AcademicSetup />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="students" 
          element={
            <ProtectedRoute requiredPermission="academics:read">
              <StudentDirectory />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="teachers" 
          element={
            <ProtectedRoute requiredPermission="teachers:write">
              <TeacherDirectory />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="attendance" 
          element={
            <ProtectedRoute requiredPermission="academics:read">
              <AttendanceSystem />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="marks" 
          element={
            <ProtectedRoute requiredPermission="academics:read">
              <GradesSystem />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="finance" 
          element={
            <ProtectedRoute requiredPermission="finance:read">
              <FinanceSystem />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="assignments" 
          element={
            <ProtectedRoute requiredPermission="academics:read">
              <AssignmentsSystem />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="library" 
          element={
            <ProtectedRoute requiredPermission="library:read">
              <LibrarySystem />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="announcements" 
          element={<AnnouncementsBoard />} 
        />
        
        <Route 
          path="audit" 
          element={
            <ProtectedRoute requiredPermission="audit:read">
              <AuditLogs />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Fallback to Dashboard/Login */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
