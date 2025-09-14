import { supabase } from '../lib/supabase';
import { User } from '../types/User';
import { activityService } from './activityService';

// Helper function to convert database user to application User type
const convertDbUserToUser = (dbUser: any): User => ({
  id: dbUser.id,
  email: dbUser.email,
  role: dbUser.role,
  status: dbUser.status,
  name: dbUser.name,
  fatherName: dbUser.father_name,
  lastName: dbUser.last_name,
  dateOfBirth: dbUser.date_of_birth,
  gender: dbUser.gender,
  nationalId: dbUser.national_id,
  passportNo: dbUser.passport_no,
  phone: dbUser.phone,
  address: dbUser.address,
  parentContact: dbUser.parent_contact,
  photo: dbUser.photo,
  jobTitle: dbUser.job_title,
  jobDescription: dbUser.job_description,
  joinDate: dbUser.join_date,
  leaveDate: dbUser.leave_date,
  educationDocuments: dbUser.education_documents,
  cv: dbUser.cv,
  activityHistory: dbUser.activity_history,
  shortBio: dbUser.short_bio,
  classesTeaching: dbUser.classes_teaching,
  educationLevel: dbUser.education_level,
  createdAt: dbUser.created_at,
  updatedAt: dbUser.updated_at
});

// Helper function to convert application User to database format
const convertUserToDbUser = (user: Partial<User>) => ({
  email: user.email,
  role: user.role,
  status: user.status,
  name: user.name,
  father_name: user.fatherName,
  last_name: user.lastName,
  date_of_birth: user.dateOfBirth,
  gender: user.gender,
  national_id: user.nationalId,
  passport_no: user.passportNo,
  phone: user.phone,
  address: user.address,
  parent_contact: user.parentContact,
  photo: user.photo?.[0] || user.photo, // Handle array format from FileUpload
  job_title: user.jobTitle,
  job_description: user.jobDescription,
  join_date: user.joinDate,
  leave_date: user.leaveDate,
  education_documents: user.educationDocuments,
  cv: user.cv?.[0] || user.cv, // Handle array format from FileUpload
  activity_history: user.activityHistory,
  short_bio: user.shortBio,
  classes_teaching: user.classesTeaching,
  education_level: user.educationLevel
});

export const userService = {
  async getAllUsers(): Promise<User[]> {
    console.log('👥 UserService.getAllUsers - Fetching all users');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ UserService.getAllUsers - Error:', error);
        throw error;
      }

      const users = data?.map(convertDbUserToUser) || [];
      console.log('📊 UserService.getAllUsers - Users count:', users.length);
      return users;
    } catch (error) {
      console.error('❌ UserService.getAllUsers - Error:', error);
      throw error;
    }
  },

  async getPendingUsers(): Promise<User[]> {
    console.log('⏳ UserService.getPendingUsers - Fetching pending users');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ UserService.getPendingUsers - Error:', error);
        throw error;
      }

      const users = data?.map(convertDbUserToUser) || [];
      console.log('📊 UserService.getPendingUsers - Pending users count:', users.length);
      return users;
    } catch (error) {
      console.error('❌ UserService.getPendingUsers - Error:', error);
      throw error;
    }
  },

  async getUsersByRole(role: string): Promise<User[]> {
    console.log('👤 UserService.getUsersByRole - Fetching users by role:', role);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ UserService.getUsersByRole - Error:', error);
        throw error;
      }

      const users = data?.map(convertDbUserToUser) || [];
      console.log('📊 UserService.getUsersByRole - Users count:', users.length);
      return users;
    } catch (error) {
      console.error('❌ UserService.getUsersByRole - Error:', error);
      throw error;
    }
  },

  async approveUser(userId: string, adminId: string): Promise<void> {
    console.log('✅ UserService.approveUser - Approving user:', userId);
    
    try {
      // Get user details first
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('name, last_name, role')
        .eq('id', userId)
        .single();

      if (fetchError || !user) {
        throw new Error('User not found');
      }

      const { error } = await supabase
        .from('users')
        .update({ status: 'approved' })
        .eq('id', userId);

      if (error) {
        console.error('❌ UserService.approveUser - Error:', error);
        throw error;
      }

      console.log('✅ UserService.approveUser - User approved successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'user_approved',
          title: 'User Approved',
          description: `${user.name} ${user.last_name} (${user.role}) was approved`,
          userId: adminId,
          targetId: userId,
          targetType: 'user',
          metadata: { userRole: user.role }
        });
      } catch (activityError) {
        console.warn('⚠️ UserService.approveUser - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ UserService.approveUser - Error:', error);
      throw error;
    }
  },

  async rejectUser(userId: string, adminId: string): Promise<void> {
    console.log('❌ UserService.rejectUser - Rejecting user:', userId);
    
    try {
      // Get user details first
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('name, last_name, role')
        .eq('id', userId)
        .single();

      if (fetchError || !user) {
        throw new Error('User not found');
      }

      const { error } = await supabase
        .from('users')
        .update({ status: 'rejected' })
        .eq('id', userId);

      if (error) {
        console.error('❌ UserService.rejectUser - Error:', error);
        throw error;
      }

      console.log('✅ UserService.rejectUser - User rejected successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'user_rejected',
          title: 'User Rejected',
          description: `${user.name} ${user.last_name} (${user.role}) was rejected`,
          userId: adminId,
          targetId: userId,
          targetType: 'user',
          metadata: { userRole: user.role }
        });
      } catch (activityError) {
        console.warn('⚠️ UserService.rejectUser - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ UserService.rejectUser - Error:', error);
      throw error;
    }
  },

  async updateUser(userId: string, userData: Partial<User>, adminId: string): Promise<void> {
    console.log('✏️ UserService.updateUser - Updating user:', userId);
    
    try {
      const dbUserData = convertUserToDbUser(userData);
      
      const { error } = await supabase
        .from('users')
        .update(dbUserData)
        .eq('id', userId);

      if (error) {
        console.error('❌ UserService.updateUser - Error:', error);
        throw error;
      }

      console.log('✅ UserService.updateUser - User updated successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'user_updated',
          title: 'User Updated',
          description: `User profile was updated`,
          userId: adminId,
          targetId: userId,
          targetType: 'user',
          metadata: { changes: Object.keys(userData) }
        });
      } catch (activityError) {
        console.warn('⚠️ UserService.updateUser - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ UserService.updateUser - Error:', error);
      throw error;
    }
  },

  async deleteUser(userId: string, adminId: string): Promise<void> {
    console.log('🗑️ UserService.deleteUser - Deleting user:', userId);
    
    try {
      // Get user details first
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('name, last_name, role')
        .eq('id', userId)
        .single();

      if (fetchError || !user) {
        throw new Error('User not found');
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ UserService.deleteUser - Error:', error);
        throw error;
      }

      console.log('✅ UserService.deleteUser - User deleted successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'user_deleted',
          title: 'User Deleted',
          description: `${user.name} ${user.last_name} (${user.role}) was deleted`,
          userId: adminId,
          targetId: userId,
          targetType: 'user',
          metadata: { userRole: user.role }
        });
      } catch (activityError) {
        console.warn('⚠️ UserService.deleteUser - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ UserService.deleteUser - Error:', error);
      throw error;
    }
  },

  async promoteToAdmin(userId: string, adminId: string): Promise<void> {
    console.log('⬆️ UserService.promoteToAdmin - Promoting user to admin:', userId);
    
    try {
      // Get user details first
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('name, last_name, role')
        .eq('id', userId)
        .single();

      if (fetchError || !user) {
        throw new Error('User not found');
      }

      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);

      if (error) {
        console.error('❌ UserService.promoteToAdmin - Error:', error);
        throw error;
      }

      console.log('✅ UserService.promoteToAdmin - User promoted successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'user_promoted',
          title: 'User Promoted to Admin',
          description: `${user.name} ${user.last_name} was promoted from ${user.role} to admin`,
          userId: adminId,
          targetId: userId,
          targetType: 'user',
          metadata: { previousRole: user.role, newRole: 'admin' }
        });
      } catch (activityError) {
        console.warn('⚠️ UserService.promoteToAdmin - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ UserService.promoteToAdmin - Error:', error);
      throw error;
    }
  },

  async addUser(userData: Partial<User>, adminId: string): Promise<void> {
    console.log('➕ UserService.addUser - Adding new user');
    
    try {
      const dbUserData = convertUserToDbUser(userData);
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([dbUserData])
        .select()
        .single();

      if (error) {
        console.error('❌ UserService.addUser - Error:', error);
        throw error;
      }

      console.log('✅ UserService.addUser - User added successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'user_created',
          title: 'User Created',
          description: `${userData.name} ${userData.lastName} (${userData.role}) was created by admin`,
          userId: adminId,
          targetId: newUser.id,
          targetType: 'user',
          metadata: { userRole: userData.role }
        });
      } catch (activityError) {
        console.warn('⚠️ UserService.addUser - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ UserService.addUser - Error:', error);
      throw error;
    }
  }
};