-- Apex SMS PostgreSQL Database Initialization Schema
-- Enabling UUID and Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- MODULE 1: AUTHENTICATION AND ROLE BASED ACCESS CONTROL (RBAC)
-- =========================================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL, -- references auth.users(id)
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =========================================================================
-- MODULE 2: USERS AND PROFILES
-- =========================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- references auth.users(id) on delete cascade
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
    must_change_password BOOLEAN DEFAULT false NOT NULL,
    avatar_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    qualifications TEXT,
    department_id UUID, -- Will resolve references later to avoid cyclic dependencies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE parent_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    guardian_name VARCHAR(255),
    relation_type VARCHAR(50) CHECK (relation_type IN ('father', 'mother', 'guardian', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE student_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    medical_notes TEXT,
    parent_id UUID REFERENCES parent_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- M2M mapping table to allow a parent to oversee multiple children
CREATE TABLE parent_students (
    parent_id UUID REFERENCES parent_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, student_id)
);

-- =========================================================================
-- MODULE 3: ACADEMIC STRUCTURE
-- =========================================================================

CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(20) UNIQUE NOT NULL, -- e.g. "2026/2027"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT date_range_check CHECK (end_date > start_date)
);

CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL, -- e.g. "Term 1"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT term_date_range_check CHECK (end_date > start_date)
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    head_of_department_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL
);

-- Add foreign key constraint to staff_profiles department_id
ALTER TABLE staff_profiles 
ADD CONSTRAINT fk_staff_department 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g. "MAT101"
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL -- e.g. "Senior 1", "Senior 2"
);

CREATE TABLE streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL -- e.g. "A", "B", "West"
);

CREATE TABLE class_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
    class_teacher_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    UNIQUE (class_id, stream_id, academic_year_id)
);

CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
    class_stream_id UUID REFERENCES class_streams(id) ON DELETE RESTRICT NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE RESTRICT NOT NULL,
    term_id UUID REFERENCES terms(id) ON DELETE RESTRICT NOT NULL,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'promoted', 'transferred', 'suspended', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE (student_id, academic_year_id, term_id)
);

CREATE TABLE subject_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES staff_profiles(id) ON DELETE CASCADE NOT NULL,
    class_stream_id UUID REFERENCES class_streams(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
    UNIQUE (teacher_id, class_stream_id, subject_id, academic_year_id)
);

-- =========================================================================
-- MODULE 4: ATTENDANCE
-- =========================================================================

CREATE TABLE student_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
    class_stream_id UUID REFERENCES class_streams(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'sick', 'excused')),
    marked_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE (date, student_id)
);

CREATE TABLE teacher_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    teacher_id UUID REFERENCES staff_profiles(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'leave', 'late')),
    marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE (date, teacher_id)
);

-- =========================================================================
-- MODULE 5: EXAMINATIONS AND RESULTS
-- =========================================================================

CREATE TABLE assessment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL -- e.g. 'Test', 'Exercise', 'Mid-Term', 'End-Term', 'Continuous Assessment'
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    assessment_type_id UUID REFERENCES assessment_types(id) ON DELETE RESTRICT NOT NULL,
    class_stream_id UUID REFERENCES class_streams(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    max_marks NUMERIC(5,2) NOT NULL CHECK (max_marks > 0),
    weightage NUMERIC(5,2) DEFAULT 100.00 NOT NULL CHECK (weightage >= 0 AND weightage <= 100),
    date_conducted DATE NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
    term_id UUID REFERENCES terms(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE student_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
    marks_obtained NUMERIC(5,2) NOT NULL,
    graded_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE (assessment_id, student_id),
    CONSTRAINT marks_obtained_limit CHECK (marks_obtained >= 0)
);

-- =========================================================================
-- MODULE 6: FINANCE
-- =========================================================================

CREATE TABLE fee_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g. "Tuition", "Boarding", "Development", "Examination"
    description TEXT
);

CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE NOT NULL,
    term_id UUID REFERENCES terms(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    fee_type_id UUID REFERENCES fee_types(id) ON DELETE RESTRICT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    UNIQUE (academic_year_id, term_id, class_id, fee_type_id)
);

CREATE TABLE student_fee_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE RESTRICT NOT NULL,
    term_id UUID REFERENCES terms(id) ON DELETE RESTRICT NOT NULL,
    total_due NUMERIC(12,2) DEFAULT 0.00 NOT NULL CHECK (total_due >= 0),
    total_paid NUMERIC(12,2) DEFAULT 0.00 NOT NULL CHECK (total_paid >= 0),
    balance NUMERIC(12,2) GENERATED ALWAYS AS (total_due - total_paid) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE (student_id, academic_year_id, term_id)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_fee_account_id UUID REFERENCES student_fee_accounts(id) ON DELETE RESTRICT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'mobile_money')),
    reference_no VARCHAR(100) UNIQUE,
    received_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    notes TEXT
);

CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID UNIQUE REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================================
-- MODULE 7: COMMUNICATION
-- =========================================================================

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('teachers', 'students', 'parents', 'all')),
    file_url VARCHAR(512),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================================
-- MODULE 8: ASSIGNMENT SYSTEM (VERSION 2)
-- =========================================================================

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url VARCHAR(512),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    subject_teacher_id UUID REFERENCES subject_teachers(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
    file_url VARCHAR(512),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'marked')),
    marks NUMERIC(5,2) CHECK (marks >= 0),
    feedback TEXT,
    marked_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    marked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (assignment_id, student_id)
);

-- =========================================================================
-- MODULE 9: ONLINE LIBRARY (VERSION 2)
-- =========================================================================

CREATE TABLE library_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE library_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('books', 'notes', 'study guides', 'syllabi', 'past exams')),
    file_url VARCHAR(512) NOT NULL,
    category_id UUID REFERENCES library_categories(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT false NOT NULL,
    approved_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================================
-- MODULE 10: AUDIT TRAIL AND SYSTEM LOGS (VERSION 2)
-- =========================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- NULL if system action
    action VARCHAR(50) NOT NULL, -- e.g. 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'GRADE_CHANGE', 'FEE_CHANGE'
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL,
    notification_type VARCHAR(20) DEFAULT 'system' CHECK (notification_type IN ('email', 'sms', 'system')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================================================
-- DATA CONSTRAINTS AND INDEXES
-- =========================================================================

-- Performance & Query Optimization Indexes
CREATE INDEX idx_student_enrollments_student_year ON student_enrollments(student_id, academic_year_id);
CREATE INDEX idx_student_enrollments_class_stream ON student_enrollments(class_stream_id);
CREATE INDEX idx_student_attendance_date ON student_attendance(date);
CREATE INDEX idx_student_attendance_student_date ON student_attendance(student_id, date);
CREATE INDEX idx_student_marks_student_assessment ON student_marks(student_id, assessment_id);
CREATE INDEX idx_subject_teachers_teacher ON subject_teachers(teacher_id);
CREATE INDEX idx_fee_structures_class_term ON fee_structures(class_id, academic_year_id, term_id);
CREATE INDEX idx_student_fee_accounts_balance ON student_fee_accounts(balance);
CREATE INDEX idx_audit_logs_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_library_resources_approved ON library_resources(is_approved, category_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read);
