-- Apex SMS PostgreSQL Triggers Migration Script

-- =========================================================================
-- TRIGGER 1: SYNC USER PROFILE ON auth.users CREATION
-- =========================================================================

CREATE OR REPLACE FUNCTION sync_user_profile_func()
RETURNS TRIGGER SECURITY DEFINER AS $$
DECLARE
    v_first_name VARCHAR(100);
    v_last_name VARCHAR(100);
    v_role_name VARCHAR(50);
    v_role_id UUID;
    v_must_change BOOLEAN;
    v_status VARCHAR(20);
BEGIN
    -- Extract metadata if present
    v_first_name := COALESCE(new.raw_user_meta_data->>'first_name', 'New');
    v_last_name := COALESCE(new.raw_user_meta_data->>'last_name', 'User');
    v_role_name := COALESCE(new.raw_user_meta_data->>'role', 'student'); -- Default to student role
    v_must_change := COALESCE((new.raw_user_meta_data->>'must_change_password')::boolean, false);
    v_status := COALESCE(new.raw_user_meta_data->>'status', 'active');

    -- Insert into profiles
    INSERT INTO public.profiles (id, first_name, last_name, email, phone_number, status, must_change_password, created_at, updated_at)
    VALUES (
        new.id,
        v_first_name,
        v_last_name,
        new.email,
        new.phone,
        v_status,
        v_must_change,
        new.created_at,
        new.updated_at
    );

    -- Find and assign role
    SELECT id INTO v_role_id FROM public.roles WHERE name = v_role_name;
    IF v_role_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (new.id, v_role_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- To test locally or execute on production, attach this trigger to auth.users (if it exists)
-- CREATE TRIGGER sync_user_profile_trigger
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION sync_user_profile_func();


-- =========================================================================
-- TRIGGER 2: AUTOMATIC AUDIT LOGGING FOR CRITICAL TABLES
-- =========================================================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID;
    v_action VARCHAR;
    v_old JSONB := NULL;
    v_new JSONB := NULL;
BEGIN
    -- Try to capture Supabase auth.uid() or use system user if not in API context
    BEGIN
        v_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;
    
    v_action := TG_OP;
    
    IF (TG_OP = 'UPDATE') THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_new := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        v_old := to_jsonb(OLD);
    END IF;
    
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        v_user_id, 
        v_action, 
        TG_TABLE_NAME, 
        COALESCE(NEW.id, OLD.id), 
        v_old, 
        v_new
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Bind audit triggers
CREATE TRIGGER audit_student_marks_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.student_marks
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_payments_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_profiles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();


-- =========================================================================
-- TRIGGER 3: SERIALIZED RECEIPT NUMBER GENERATOR ON PAYMENTS
-- =========================================================================

CREATE OR REPLACE FUNCTION generate_payment_receipt_func()
RETURNS TRIGGER SECURITY DEFINER AS $$
DECLARE
    v_serial INTEGER;
    v_receipt_no VARCHAR(100);
    v_date_str VARCHAR(8);
BEGIN
    -- Format date as YYYYMMDD
    v_date_str := to_char(NEW.payment_date, 'YYYYMMDD');
    
    -- Count receipts issued today for the sequence
    SELECT COALESCE(COUNT(*), 0) + 1 INTO v_serial
    FROM public.receipts
    WHERE receipt_number LIKE 'REC-' || v_date_str || '%';

    -- Generate receipt number e.g. REC-20260623-0001
    v_receipt_no := 'REC-' || v_date_str || '-' || lpad(v_serial::text, 4, '0');

    -- Insert into receipts
    INSERT INTO public.receipts (payment_id, receipt_number)
    VALUES (NEW.id, v_receipt_no);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_payment_receipt_trigger
AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION generate_payment_receipt_func();
