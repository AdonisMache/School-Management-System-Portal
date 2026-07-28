-- Apex SMS Helper Functions for RLS Policies and Dynamic Role-Permission Checking

-- Helper to check if a user possesses a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(p_user_id UUID, p_permission VARCHAR)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id AND p.code = p_permission
    );
END;
$$ LANGUAGE plpgsql;

-- Helper to check if a user is assigned to a specific role name
CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role VARCHAR)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id AND r.name = p_role
    );
END;
$$ LANGUAGE plpgsql;

-- Helper function to fetch all permissions for a user (useful for API and client-side setup)
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (permission_code VARCHAR, permission_description TEXT) SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.code, p.description
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to fetch all roles for a user
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE (role_name VARCHAR, role_description TEXT) SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT r.name, r.description
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
