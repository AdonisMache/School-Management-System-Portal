-- Apex SMS Row Level Security (RLS) Policies Migration Script

-- =========================================================================
-- MODULE 1: AUTHENTICATION AND RBAC TABLES
-- =========================================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow manage for admins on roles" ON roles FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'rbac:manage'));

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on permissions" ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow manage for admins on permissions" ON permissions FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'rbac:manage'));

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on role_permissions" ON role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow manage for admins on role_permissions" ON role_permissions FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'rbac:manage'));

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on user_roles" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow manage for admins on user_roles" ON user_roles FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'users:manage') OR user_has_permission(auth.uid(), 'rbac:manage'));

-- =========================================================================
-- MODULE 2: USERS AND PROFILES
-- =========================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow update for owner on profiles" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow manage for admins on profiles" ON profiles FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'users:manage'));

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on staff_profiles" ON staff_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow manage for admins on staff_profiles" ON staff_profiles FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'users:manage'));

ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on parent_profiles" ON parent_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow manage for admins on parent_profiles" ON parent_profiles FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'users:manage'));

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for staff, parent, self on student_profiles" ON student_profiles FOR SELECT TO authenticated USING (
    user_has_permission(auth.uid(), 'academics:read') OR 
    auth.uid() = id OR 
    auth.uid() = parent_id OR
    auth.uid() IN (SELECT parent_id FROM parent_students WHERE student_id = student_profiles.id)
);
CREATE POLICY "Allow manage for admins on student_profiles" ON student_profiles FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'students:write'));

ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on parent_students" ON parent_students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow manage for admins on parent_students" ON parent_students FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'users:manage'));

-- =========================================================================
-- MODULE 3: ACADEMIC STRUCTURE
-- =========================================================================

ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on academic_years" ON academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for admins on academic_years" ON academic_years FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'academics:write'));

ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on terms" ON terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for admins on terms" ON terms FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'academics:write'));

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for admins on departments" ON departments FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'academics:write'));

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for admins on subjects" ON subjects FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'academics:write'));

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on classes" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for admins on classes" ON classes FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'academics:write'));

ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on streams" ON streams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for admins on streams" ON streams FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'academics:write'));

ALTER TABLE class_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on class_streams" ON class_streams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for admins on class_streams" ON class_streams FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'academics:write'));

ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read student_enrollments" ON student_enrollments FOR SELECT TO authenticated USING (
    user_has_permission(auth.uid(), 'academics:read') OR
    auth.uid() = student_id OR
    auth.uid() IN (SELECT parent_id FROM parent_students WHERE student_id = student_enrollments.student_id)
);
CREATE POLICY "Allow write student_enrollments" ON student_enrollments FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'students:write'));

ALTER TABLE subject_teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on subject_teachers" ON subject_teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for admins on subject_teachers" ON subject_teachers FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'academics:write'));

-- =========================================================================
-- MODULE 4: ATTENDANCE
-- =========================================================================

ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read student_attendance" ON student_attendance FOR SELECT TO authenticated USING (
    user_has_permission(auth.uid(), 'academics:read') OR
    auth.uid() = student_id OR
    auth.uid() IN (SELECT parent_id FROM parent_students WHERE student_id = student_attendance.student_id)
);
CREATE POLICY "Allow write student_attendance" ON student_attendance FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'attendance:write'));

ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read teacher_attendance" ON teacher_attendance FOR SELECT TO authenticated USING (
    user_has_permission(auth.uid(), 'academics:read') OR
    auth.uid() = teacher_id
);
CREATE POLICY "Allow write teacher_attendance" ON teacher_attendance FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'teacher_attendance:write'));

-- =========================================================================
-- MODULE 5: EXAMINATIONS AND RESULTS
-- =========================================================================

ALTER TABLE assessment_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on assessment_types" ON assessment_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for admins on assessment_types" ON assessment_types FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'academics:write'));

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read assessments" ON assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write assessments" ON assessments FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'assignments:write') OR user_has_permission(auth.uid(), 'marks:write'));

ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read student_marks" ON student_marks FOR SELECT TO authenticated USING (
    user_has_permission(auth.uid(), 'academics:read') OR
    auth.uid() = student_id OR
    auth.uid() IN (SELECT parent_id FROM parent_students WHERE student_id = student_marks.student_id)
);
CREATE POLICY "Allow write student_marks" ON student_marks FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'marks:write'));

-- =========================================================================
-- MODULE 6: FINANCE
-- =========================================================================

ALTER TABLE fee_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated on fee_types" ON fee_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write for accountants on fee_types" ON fee_types FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'finance:write'));

ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read fee_structures" ON fee_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write fee_structures" ON fee_structures FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'finance:write'));

ALTER TABLE student_fee_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read student_fee_accounts" ON student_fee_accounts FOR SELECT TO authenticated USING (
    user_has_permission(auth.uid(), 'finance:read') OR
    auth.uid() = student_id OR
    auth.uid() IN (SELECT parent_id FROM parent_students WHERE student_id = student_fee_accounts.student_id)
);
CREATE POLICY "Allow write student_fee_accounts" ON student_fee_accounts FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'finance:write'));

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read payments" ON payments FOR SELECT TO authenticated USING (
    user_has_permission(auth.uid(), 'finance:read') OR
    auth.uid() IN (SELECT sfa.student_id FROM student_fee_accounts sfa WHERE sfa.id = student_fee_account_id) OR
    auth.uid() IN (
        SELECT ps.parent_id 
        FROM parent_students ps
        JOIN student_fee_accounts sfa ON ps.student_id = sfa.student_id 
        WHERE sfa.id = student_fee_account_id
    )
);
CREATE POLICY "Allow write payments" ON payments FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'finance:write'));

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read receipts" ON receipts FOR SELECT TO authenticated USING (
    user_has_permission(auth.uid(), 'finance:read') OR
    auth.uid() IN (
        SELECT sfa.student_id 
        FROM payments p
        JOIN student_fee_accounts sfa ON p.student_fee_account_id = sfa.id
        WHERE p.id = payment_id
    ) OR
    auth.uid() IN (
        SELECT ps.parent_id 
        FROM parent_students ps
        JOIN student_fee_accounts sfa ON ps.student_id = sfa.student_id
        JOIN payments p ON p.student_fee_account_id = sfa.id
        WHERE p.id = payment_id
    )
);
CREATE POLICY "Allow write receipts" ON receipts FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'finance:write'));

-- =========================================================================
-- MODULE 7: COMMUNICATION
-- =========================================================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read announcements" ON announcements FOR SELECT TO authenticated USING (
    target_audience = 'all' OR
    (target_audience = 'teachers' AND user_has_role(auth.uid(), 'teacher')) OR
    (target_audience = 'students' AND user_has_role(auth.uid(), 'student')) OR
    (target_audience = 'parents' AND user_has_role(auth.uid(), 'parent')) OR
    user_has_permission(auth.uid(), 'academics:read')
);
CREATE POLICY "Allow write announcements" ON announcements FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'announcements:write'));

-- =========================================================================
-- MODULE 8: ASSIGNMENT SYSTEM (VERSION 2)
-- =========================================================================

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read assignments" ON assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write assignments" ON assignments FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'assignments:write'));

ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read assignment_submissions" ON assignment_submissions FOR SELECT TO authenticated USING (
    user_has_permission(auth.uid(), 'assignments:write') OR
    auth.uid() = student_id OR
    auth.uid() IN (SELECT parent_id FROM parent_students WHERE student_id = assignment_submissions.student_id)
);
CREATE POLICY "Allow write assignment_submissions" ON assignment_submissions FOR ALL TO authenticated USING (
    user_has_permission(auth.uid(), 'assignments:submit') OR
    user_has_permission(auth.uid(), 'assignments:write')
);

-- =========================================================================
-- MODULE 9: ONLINE LIBRARY (VERSION 2)
-- =========================================================================

ALTER TABLE library_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read library_categories" ON library_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write library_categories" ON library_categories FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'library:write'));

ALTER TABLE library_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read library_resources" ON library_resources FOR SELECT TO authenticated USING (
    is_approved = true OR
    uploader_id = auth.uid() OR
    user_has_permission(auth.uid(), 'library:approve')
);
CREATE POLICY "Allow upload library_resources" ON library_resources FOR INSERT TO authenticated WITH CHECK (user_has_permission(auth.uid(), 'library:write'));
CREATE POLICY "Allow manage library_resources" ON library_resources FOR ALL TO authenticated USING (user_has_permission(auth.uid(), 'library:approve') OR uploader_id = auth.uid());

-- =========================================================================
-- MODULE 10: AUDIT TRAIL AND SYSTEM LOGS (VERSION 2)
-- =========================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read audit_logs" ON audit_logs FOR SELECT TO authenticated USING (user_has_permission(auth.uid(), 'audit:read'));

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow manage own notifications" ON notifications FOR ALL TO authenticated USING (auth.uid() = user_id);
