import { supabase } from '../lib/supabase';
import { StudentFeedback } from '../types/Class';
import { activityService } from './activityService';

export const feedbackService = {
  async getClassFeedbacks(classId: string): Promise<StudentFeedback[]> {
    console.log('📝 FeedbackService.getClassFeedbacks - Fetching feedbacks for class:', classId);
    
    try {
      const { data, error } = await supabase
        .from('student_feedbacks')
        .select(`
          *,
          student:users!student_feedbacks_student_id_fkey (id, name, last_name, education_level),
          teacher:users!student_feedbacks_teacher_id_fkey (id, name, last_name, job_title),
          class:classes (id, name, subject)
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ FeedbackService.getClassFeedbacks - Error:', error);
        throw error;
      }

      const feedbacks = data?.map(convertDbFeedbackToFeedback) || [];
      console.log('📊 FeedbackService.getClassFeedbacks - Feedbacks count:', feedbacks.length);
      return feedbacks;
    } catch (error) {
      console.error('❌ FeedbackService.getClassFeedbacks - Error:', error);
      throw error;
    }
  },

  async getStudentFeedbacks(studentId: string): Promise<StudentFeedback[]> {
    console.log('📝 FeedbackService.getStudentFeedbacks - Fetching feedbacks for student:', studentId);
    
    try {
      const { data, error } = await supabase
        .from('student_feedbacks')
        .select(`
          *,
          student:users!student_feedbacks_student_id_fkey (id, name, last_name, education_level),
          teacher:users!student_feedbacks_teacher_id_fkey (id, name, last_name, job_title),
          class:classes (id, name, subject)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ FeedbackService.getStudentFeedbacks - Error:', error);
        throw error;
      }

      const feedbacks = data?.map(convertDbFeedbackToFeedback) || [];
      console.log('📊 FeedbackService.getStudentFeedbacks - Feedbacks count:', feedbacks.length);
      return feedbacks;
    } catch (error) {
      console.error('❌ FeedbackService.getStudentFeedbacks - Error:', error);
      throw error;
    }
  },

  async createFeedback(feedbackData: Omit<StudentFeedback, 'id' | 'createdAt' | 'updatedAt'>, actingUserId: string): Promise<StudentFeedback> {
    console.log('➕ FeedbackService.createFeedback - Creating feedback');
    
    try {
      const { data: newFeedback, error } = await supabase
        .from('student_feedbacks')
        .insert({
          class_id: feedbackData.classId,
          student_id: feedbackData.studentId,
          teacher_id: feedbackData.teacherId,
          score: feedbackData.score,
          feedback: feedbackData.feedback
        })
        .select(`
          *,
          student:users!student_feedbacks_student_id_fkey (id, name, last_name, education_level),
          teacher:users!student_feedbacks_teacher_id_fkey (id, name, last_name, job_title),
          class:classes (id, name, subject)
        `)
        .single();

      if (error) {
        console.error('❌ FeedbackService.createFeedback - Error:', error);
        throw error;
      }

      console.log('✅ FeedbackService.createFeedback - Feedback created successfully');

      const feedback = convertDbFeedbackToFeedback(newFeedback);

      // Log activity
      try {
        await activityService.logActivity({
          type: 'student_enrolled', // We'll use this as closest match
          title: 'Student Feedback Added',
          description: `${feedback.teacher?.name} gave feedback to ${feedback.student?.name} in ${feedback.class?.name}`,
          userId: actingUserId,
          targetId: feedback.id,
          targetType: 'class',
          metadata: { 
            score: feedback.score,
            studentName: feedback.student?.name,
            className: feedback.class?.name
          }
        });
      } catch (activityError) {
        console.warn('⚠️ FeedbackService.createFeedback - Activity logging failed:', activityError);
      }

      return feedback;
    } catch (error) {
      console.error('❌ FeedbackService.createFeedback - Error:', error);
      throw error;
    }
  },

  async updateFeedback(feedbackId: string, feedbackData: Partial<StudentFeedback>, actingUserId: string): Promise<void> {
    console.log('✏️ FeedbackService.updateFeedback - Updating feedback:', feedbackId);
    
    try {
      const dbUpdate: any = {};
      
      if (feedbackData.score !== undefined) dbUpdate.score = feedbackData.score;
      if (feedbackData.feedback !== undefined) dbUpdate.feedback = feedbackData.feedback;

      const { error } = await supabase
        .from('student_feedbacks')
        .update(dbUpdate)
        .eq('id', feedbackId);

      if (error) {
        console.error('❌ FeedbackService.updateFeedback - Error:', error);
        throw error;
      }

      console.log('✅ FeedbackService.updateFeedback - Feedback updated successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'student_enrolled', // We'll use this as closest match
          title: 'Student Feedback Updated',
          description: `Student feedback was updated`,
          userId: actingUserId,
          targetId: feedbackId,
          targetType: 'class',
          metadata: { changes: feedbackData }
        });
      } catch (activityError) {
        console.warn('⚠️ FeedbackService.updateFeedback - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ FeedbackService.updateFeedback - Error:', error);
      throw error;
    }
  },

  async deleteFeedback(feedbackId: string, actingUserId: string): Promise<void> {
    console.log('🗑️ FeedbackService.deleteFeedback - Deleting feedback:', feedbackId);
    
    try {
      // Get feedback details first for logging
      const { data: feedback, error: fetchError } = await supabase
        .from('student_feedbacks')
        .select(`
          *,
          student:users!student_feedbacks_student_id_fkey (name, last_name),
          class:classes (name, subject)
        `)
        .eq('id', feedbackId)
        .single();

      if (fetchError || !feedback) {
        throw new Error('Feedback not found');
      }

      // Delete the feedback
      const { error: deleteError } = await supabase
        .from('student_feedbacks')
        .delete()
        .eq('id', feedbackId);

      if (deleteError) {
        console.error('❌ FeedbackService.deleteFeedback - Error:', deleteError);
        throw deleteError;
      }

      console.log('✅ FeedbackService.deleteFeedback - Feedback deleted successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'student_unenrolled', // We'll use this as closest match
          title: 'Student Feedback Deleted',
          description: `Feedback for ${feedback.student?.name} in ${feedback.class?.name} was deleted`,
          userId: actingUserId,
          targetId: feedbackId,
          targetType: 'class',
          metadata: { 
            studentName: feedback.student?.name,
            className: feedback.class?.name
          }
        });
      } catch (activityError) {
        console.warn('⚠️ FeedbackService.deleteFeedback - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ FeedbackService.deleteFeedback - Error:', error);
      throw error;
    }
  }
};

// Helper function to convert database feedback to application StudentFeedback type
const convertDbFeedbackToFeedback = (dbFeedback: any): StudentFeedback => ({
  id: dbFeedback.id,
  classId: dbFeedback.class_id,
  studentId: dbFeedback.student_id,
  teacherId: dbFeedback.teacher_id,
  score: dbFeedback.score,
  feedback: dbFeedback.feedback,
  createdAt: dbFeedback.created_at,
  updatedAt: dbFeedback.updated_at,
  student: dbFeedback.student ? {
    id: dbFeedback.student.id,
    name: dbFeedback.student.name,
    lastName: dbFeedback.student.last_name,
    educationLevel: dbFeedback.student.education_level
  } : undefined,
  teacher: dbFeedback.teacher ? {
    id: dbFeedback.teacher.id,
    name: dbFeedback.teacher.name,
    lastName: dbFeedback.teacher.last_name,
    jobTitle: dbFeedback.teacher.job_title
  } : undefined,
  class: dbFeedback.class ? {
    id: dbFeedback.class.id,
    name: dbFeedback.class.name,
    subject: dbFeedback.class.subject
  } : undefined
});