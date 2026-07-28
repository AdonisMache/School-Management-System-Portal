import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: string[];
  permissions: string[];
  mustChangePassword: boolean;
  status: string;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  signOut: () => Promise<void>;
  refreshUserRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);

  const fetchRolesAndPermissions = async (userId: string) => {
    try {
      // 1. Fetch user profile fields (status & must_change_password)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('status, must_change_password')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileData) {
        setStatus(profileData.status || 'active');
        setMustChangePassword(profileData.must_change_password || false);
        
        // Auto sign out if user is suspended/archived
        if (profileData.status === 'suspended' || profileData.status === 'archived') {
          await supabase.auth.signOut();
          setRoles([]);
          setPermissions([]);
          setStatus(profileData.status);
          setMustChangePassword(false);
          return;
        }
      }

      // 2. Fetch user roles using RPC
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_roles', { p_user_id: userId });

      // Fallback to table queries if RPC has not been initialized yet
      let userRolesList: string[] = [];
      if (roleError) {
        const { data: tableRoleData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', userId);
        
        userRolesList = tableRoleData
          ? (tableRoleData as any[]).map((r) => r.roles?.name).filter(Boolean)
          : [];
      } else {
        userRolesList = roleData ? (roleData as any[]).map((r) => r.role_name) : [];
      }

      // 3. Fetch user permissions using RPC
      const { data: permData, error: permError } = await supabase
        .rpc('get_user_permissions', { p_user_id: userId });

      let userPermissionsList: string[] = [];
      if (permError) {
        const { data: tablePermData } = await supabase
          .from('user_roles')
          .select('role_permissions(permissions(code))')
          .eq('user_id', userId);

        if (tablePermData) {
          const flatPerms = tablePermData.flatMap((ur: any) => 
            ur.role_permissions?.map((rp: any) => rp.permissions?.code).filter(Boolean) || []
          );
          userPermissionsList = Array.from(new Set(flatPerms));
        }
      } else {
        userPermissionsList = permData ? (permData as any[]).map((p) => p.permission_code) : [];
      }

      setRoles(userRolesList);
      setPermissions(userPermissionsList);
    } catch (err) {
      console.error('Failed to load user roles/permissions:', err);
    }
  };

  const refreshUserRoles = async () => {
    if (user) {
      await fetchRolesAndPermissions(user.id);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRolesAndPermissions(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        await fetchRolesAndPermissions(session.user.id);
        setLoading(false);
      } else {
        setRoles([]);
        setPermissions([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: string) => {
    // school_admin and super_admin override all roles checks for system processes
    return roles.includes('school_admin') || roles.includes('super_admin') || roles.includes(role);
  };

  const hasPermission = (permission: string) => {
    // school_admin and super_admin automatically have all permissions
    return roles.includes('school_admin') || roles.includes('super_admin') || permissions.includes(permission);
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setPermissions([]);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, permissions, mustChangePassword, status, hasRole, hasPermission, signOut, refreshUserRoles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
