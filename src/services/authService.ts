import { supabase } from '../lib/supabase';
import { User } from '../types/User';

export const authService = {
  async login(email: string, password: string) {
    console.log('🔐 AuthService.login - Attempting login for:', email);

    try {
      // First, try to sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      });

      if (authError) {
        console.error('❌ Supabase Auth error:', authError);
        
        // If user doesn't exist in auth, check if they exist in users table
        if (authError.message.includes('Invalid login credentials')) {
          // Query the users table to see if user exists but hasn't set up auth
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

          if (userError) {
            console.error('❌ Database query error:', userError);
            throw new Error('Database error occurred. Please try again.');
          }

          if (userData) {
            // User exists in database but not in auth - needs password setup
            throw new Error('SETUP_PASSWORD_REQUIRED');
          } else {
            throw new Error('No account found with this email address. Please check your email or register for a new account.');
          }
        } else if (authError.message.includes('Email not confirmed')) {
          throw new Error('EMAIL_NOT_CONFIRMED');
        }
        
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Login failed. Please try again.');
      }

      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError) {
        console.error('❌ Database query error:', userError);
        throw new Error('Failed to load user data. Please try again.');
      }

      // Check user status
      if (userData.status === 'pending') {
        throw new Error('Your account is pending approval. Please wait for admin approval.');
      } else if (userData.status === 'rejected') {
        throw new Error('Your account has been rejected. Please contact administration.');
      } else if (userData.status !== 'approved') {
        throw new Error('Account not approved. Please contact administration.');
      }

      // Convert database user to application User type
      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        name: userData.name,
        fatherName: userData.father_name,
        lastName: userData.last_name,
        dateOfBirth: userData.date_of_birth,
        gender: userData.gender,
        nationalId: userData.national_id,
        passportNo: userData.passport_no,
        phone: userData.phone,
        address: userData.address,
        parentContact: userData.parent_contact,
        photo: userData.photo,
        jobTitle: userData.job_title,
        jobDescription: userData.job_description,
        joinDate: userData.join_date,
        leaveDate: userData.leave_date,
        educationDocuments: userData.education_documents,
        cv: userData.cv,
        activityHistory: userData.activity_history,
        shortBio: userData.short_bio,
        classesTeaching: userData.classes_teaching,
        educationLevel: userData.education_level,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      };

      console.log('✅ Login successful for:', user.email, 'Role:', user.role);

      return {
        user,
        token: authData.session?.access_token || `token-${user.id}-${Date.now()}`
      };
    } catch (error) {
      console.error('❌ AuthService.login - Error:', error);
      throw error;
    }
  },

  async register(userData: any) {
    console.log('📝 AuthService.register - Registering user:', userData);
    
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingUser) {
        return { 
          success: false, 
          error: 'EXISTING_USER',
          message: 'An account with this email already exists. Please log in instead or use a different email address.',
          email: userData.email
        };
      }

      // Insert new user with pending status
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          role: userData.role,
          status: 'pending',
          name: userData.name,
          father_name: userData.fatherName,
          last_name: userData.lastName,
          phone: userData.phone,
          address: userData.address,
          education_level: userData.educationLevel,
          job_title: userData.jobTitle
        })
        .select()
        .single();

      if (error) {
        console.error('❌ AuthService.register - Database error:', error);
        throw new Error('Registration failed. Please try again.');
      }

      console.log('✅ AuthService.register - User registered successfully:', newUser.id);
      return { success: true };
    } catch (error) {
      console.error('❌ AuthService.register - Error:', error);
      throw error;
    }
  },

  async setupPassword(email: string, password: string) {
    console.log('🔐 AuthService.setupPassword - Setting up password for:', email);

    try {
      // Check if user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (userError) {
        console.error('❌ Database query error:', userError);
        throw new Error('Database error occurred. Please try again.');
      }

      if (!userData) {
        throw new Error('No account found with this email address.');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        throw new Error('Failed to set password. Please try again.');
      }

      console.log('✅ Password setup successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ AuthService.setupPassword - Error:', error);
      throw error;
    }
  },

  async verifyToken() {
    console.log('🔍 AuthService.verifyToken - Verifying token');
    
    try {
      // Get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        throw new Error('Invalid token');
      }

      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (userError || !userData) {
        throw new Error('Invalid token');
      }

      // Convert to User type
      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        name: userData.name,
        fatherName: userData.father_name,
        lastName: userData.last_name,
        dateOfBirth: userData.date_of_birth,
        gender: userData.gender,
        nationalId: userData.national_id,
        passportNo: userData.passport_no,
        phone: userData.phone,
        address: userData.address,
        parentContact: userData.parent_contact,
        photo: userData.photo,
        jobTitle: userData.job_title,
        jobDescription: userData.job_description,
        joinDate: userData.join_date,
        leaveDate: userData.leave_date,
        educationDocuments: userData.education_documents,
        cv: userData.cv,
        activityHistory: userData.activity_history,
        shortBio: userData.short_bio,
        classesTeaching: userData.classes_teaching,
        educationLevel: userData.education_level,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      };

      return user;
    } catch (error) {
      console.error('❌ AuthService.verifyToken - Error:', error);
      throw error;
    }
  }
};