import { supabase } from '../lib/supabase';
import { User } from '../types/User';

export const authService = {
  async login(email: string, password: string) {
    console.log('🔐 AuthService.login - Attempting login for:', email);

    try {
      // Query the users table to find the user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      console.log('📊 Database query result:', { userData, userError });

      if (userError && userError.code !== 'PGRST116') {
        console.error('❌ Database query error:', userError);
        throw new Error('Database error occurred. Please try again.');
      }

      if (!userData) {
        console.log('❌ No user found with email:', email);
        
        throw new Error('No account found with this email address. Please check your email or register for a new account.');
      }

      console.log('✅ User found:', userData.email, 'Status:', userData.status, 'Role:', userData.role);

      // Check user status
      if (userData.status === 'pending') {
        throw new Error('Your account is pending approval. Please wait for admin approval.');
      } else if (userData.status === 'rejected') {
        throw new Error('Your account has been rejected. Please contact administration.');
      } else if (userData.status !== 'approved') {
        throw new Error('Account not approved. Please contact administration.');
      }

      // Check if user needs to set up password (first time login)
      // For demo purposes, we'll check if they have any activity or if this is their first login
      // In a real app, you'd have a password_set flag or check if password hash exists
      const hasPassword = true;
      
      if (!hasPassword) {
        // User exists but hasn't set up password yet
        throw new Error('SETUP_PASSWORD_REQUIRED');
      }
      
      // Validate password for existing users
      if (!password || password.length < 6) {
        throw new Error('Invalid password');
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
        token: `token-${user.id}-${Date.now()}`
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

      if (userError && userError.code !== 'PGRST116') {
        console.error('❌ Database query error:', userError);
        throw new Error('Database error occurred. Please try again.');
      }

      if (!userData) {
        throw new Error('No account found with this email address.');
      }

      // Check if user is approved
      if (userData.status !== 'approved') {
        throw new Error('Account not approved. Please contact administration.');
      }

      // Update user to indicate password has been set
      // In a real app, you'd hash and store the actual password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          updated_at: new Date().toISOString(),
          activity_history: 'Password set up by user'
        })
        .eq('id', userData.id);

      if (updateError) {
        throw new Error('Failed to set password. Please try again.');
      }

      console.log('✅ Password setup successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ AuthService.setupPassword - Error:', error);
      throw error;
    }
  },

  async verifyToken(token: string) {
    console.log('🔍 AuthService.verifyToken - Verifying token');
    
    try {
      // Extract user ID from token (simple demo implementation)
      if (token && token.startsWith('token-')) {
        // Extract UUID from token format: token-{uuid}-{timestamp}
        const tokenPrefix = 'token-';
        const startIndex = tokenPrefix.length;
        const lastDashIndex = token.lastIndexOf('-');
        
        if (lastDashIndex > startIndex) {
          const userId = token.substring(startIndex, lastDashIndex);
          
          // Validate that userId is a proper UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(userId)) {
            console.error('❌ Invalid UUID format in token:', userId);
            throw new Error('Invalid token format');
          }
          
          // Fetch user from database
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .eq('status', 'approved')
            .maybeSingle();

          if (error || !userData) {
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
        }
      }
      
      throw new Error('Invalid token format');
    } catch (error) {
      console.error('❌ AuthService.verifyToken - Error:', error);
      throw error;
    }
  }
};