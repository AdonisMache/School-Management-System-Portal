-- VLCSMS Seed Data Scripts
-- Populate system definitions and test records

-- 1. Roles Seed
INSERT INTO roles (name, description) VALUES
('school_admin', 'School administrative management and supreme system configuration capabilities'),
('accountant', 'Fee systems configuration, invoicing, receipts and accounts reconciliations'),
('teacher', 'Marks entry, class roster loggers, notes uploads, lessons visualizer'),
('student', 'Self assignments download/upload and academic metrics tracker'),
('parent', 'Parent portal looking after kids performance and fee reports')
ON CONFLICT (name) DO NOTHING;


-- 2. Permissions Seed
INSERT INTO permissions (code, description) VALUES
('rbac:manage', 'Can view and change permissions mapping'),
('system:config', 'Configure system parameters and settings'),
('audit:read', 'Can audit system operations logs'),
('users:manage', 'Add, change, suspend, or update users accounts'),
('academics:write', 'Define terms, classes, streams, and subjects'),
('academics:read', 'View grades, rosters, streams, classes, and subjects list'),
('students:write', 'Can edit admission records, promote or transfer students'),
('teachers:write', 'Add qualifications or assign teacher departments'),
('finance:write', 'Configure fees amount, structures and record invoices'),
('finance:read', 'View receipts, statements, and financial dashboards'),
('attendance:write', 'Register daily student check-ins'),
('teacher_attendance:write', 'Register daily staff attendance sheets'),
('marks:write', 'Can entry student marks'),
('marks:approve', 'Can sign-off student term report cards'),
('announcements:write', 'Can send global or role targeted broadcast messages'),
('assignments:write', 'Can create homework papers or assignments upload files'),
('assignments:submit', 'Can hand-in assignments submissions to teachers'),
('library:write', 'Librarian uploading catalog papers or digital materials'),
('library:approve', 'Approve resources to show in catalogs'),
('library:read', 'Explore catalog items and digital resources library')
ON CONFLICT (code) DO NOTHING;

-- -- 3. Map Roles and Permissions
-- Populate role_permissions maps
DO $$
DECLARE
    v_ad_id UUID;
    v_ac_id UUID;
    v_tr_id UUID;
    v_st_id UUID;
    v_pa_id UUID;
    
    v_perm_rec RECORD;
BEGIN
    -- Fetch role IDs
    SELECT id INTO v_ad_id FROM roles WHERE name = 'school_admin';
    SELECT id INTO v_ac_id FROM roles WHERE name = 'accountant';
    SELECT id INTO v_tr_id FROM roles WHERE name = 'teacher';
    SELECT id INTO v_st_id FROM roles WHERE name = 'student';
    SELECT id INTO v_pa_id FROM roles WHERE name = 'parent';

    -- Map all permissions to School Admin
    FOR v_perm_rec IN SELECT id FROM permissions LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (v_ad_id, v_perm_rec.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Accountant mapping
    FOR v_perm_rec IN SELECT id FROM permissions WHERE code IN ('academics:read', 'finance:write', 'finance:read', 'library:read') LOOP
        INSERT INTO role_permissions (role_id, permission_id) VALUES (v_ac_id, v_perm_rec.id) ON CONFLICT DO NOTHING;
    END LOOP;

END $$;

-- 4. Academic Structure Seed
INSERT INTO classes (name) VALUES
('Form 1'),
('Form 2'),
('Form 3'),
('Form 4'),
('Form 5'),
('Form 6')
ON CONFLICT (name) DO NOTHING;

INSERT INTO streams (name) VALUES
('Stream A'),
('Stream B'),
('Stream C')
ON CONFLICT (name) DO NOTHING;

INSERT INTO fee_types (name, description) VALUES
('Tuition Fee', 'Standard academic tuition fees per term'),
('Boarding Fee', 'Accommodation and meal charges for boarding students'),
('Development Levy', 'Capital projects development fund'),
('Examination Fee', 'End of term test printings and processing charge')
ON CONFLICT (name) DO NOTHING;

INSERT INTO assessment_types (name) VALUES
('Continuous Assessment'),
('Test'),
('Exercise'),
('Mid-Term'),
('End-Term')
ON CONFLICT (name) DO NOTHING;

INSERT INTO library_categories (name, description) VALUES
('Mathematics', 'Calculus, Algebra, Geometry textbooks and guides'),
('Sciences', 'Physics, Chemistry, and Biology references'),
('Languages', 'English Literature, Grammars, and dictionaries'),
('History & Geography', 'Social science materials and maps'),
('Past Examinations', 'National examination archives and revisions')
ON CONFLICT (name) DO NOTHING;
