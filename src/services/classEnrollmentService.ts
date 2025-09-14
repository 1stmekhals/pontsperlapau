import { supabase } from '../lib/supabase';
import { ClassEnrollmentRequest } from '../types/Class';
import { activityService } from './activityService';

// Helper function to convert database enrollment request to application type
const convertDbRequestToRequest = (dbRequest: any): ClassEnrollmentRequest => ({
  id: dbRequest.id,
  classId: dbRequest.class_id,
  studentId: dbRequest.student_id,
  requestDate: dbRequest.request_date,
  status: dbRequest.status,
  notes: dbRequest.notes,
  adminNotes: dbRequest.admin_notes,
  approvedBy: dbRequest.approved_by,
  approvedAt: dbRequest.approved_at,
  createdAt: dbRequest.created_at,
  updatedAt: dbRequest.updated_at,
  class: dbRequest.classes ? {
    id: dbRequest.classes.id,
    name: dbRequest.classes.name,
    subject: dbRequest.classes.subject,
    level: dbRequest.classes.level,
    maxStudents: dbRequest.classes.max_students,
    currentStudents: dbRequest.classes.current_students
  } : undefined,
  student: dbRequest.users ? {
    id: dbRequest.users.id,
    name: dbRequest.users.name,
    lastName: dbRequest.users.last_name,
    educationLevel: dbRequest.users.education_level
  } : undefined,
  approver: dbRequest.approver ? {
    id: dbRequest.approver.id,
    name: dbRequest.approver.name,
    lastName: dbRequest.approver.last_name
  } : undefined
});

export const classEnrollmentService = {
  async createEnrollmentRequest(requestData: {
    classId: string;
    studentId: string;
    notes?: string;
  }): Promise<ClassEnrollmentRequest> {
    console.log('📚 ClassEnrollmentService.createEnrollmentRequest - Creating request');
    
    try {
      // Check if student is already enrolled or has pending request
      const { data: existingRequest } = await supabase
        .from('class_enrollment_requests')
        .select('id, status')
        .eq('class_id', requestData.classId)
        .eq('student_id', requestData.studentId)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          throw new Error('You already have a pending request for this class');
        } else if (existingRequest.status === 'approved') {
          throw new Error('You are already enrolled in this class');
        }
      }

      // Check if student is already directly enrolled
      const { data: classData } = await supabase
        .from('classes')
        .select('enrolled_students')
        .eq('id', requestData.classId)
        .single();

      if (classData?.enrolled_students?.includes(requestData.studentId)) {
        throw new Error('You are already enrolled in this class');
      }

      const { data: newRequest, error } = await supabase
        .from('class_enrollment_requests')
        .insert({
          class_id: requestData.classId,
          student_id: requestData.studentId,
          notes: requestData.notes,
          status: 'pending'
        })
        .select(`
          *,
          classes (*),
          users!class_enrollment_requests_student_id_fkey (id, name, last_name, education_level)
        `)
        .single();

      if (error) {
        console.error('❌ ClassEnrollmentService.createEnrollmentRequest - Error:', error);
        throw error;
      }

      console.log('✅ ClassEnrollmentService.createEnrollmentRequest - Request created successfully');

      const request = convertDbRequestToRequest(newRequest);

      // Log activity
      try {
        await activityService.logActivity({
          type: 'student_enrolled',
          title: 'Class Enrollment Request',
          description: `${request.student?.name} requested to join ${request.class?.name}`,
          userId: requestData.studentId,
          targetId: request.id,
          targetType: 'class',
          metadata: { 
            className: request.class?.name,
            classSubject: request.class?.subject
          }
        });
      } catch (activityError) {
        console.warn('⚠️ ClassEnrollmentService.createEnrollmentRequest - Activity logging failed:', activityError);
      }

      return request;
    } catch (error) {
      console.error('❌ ClassEnrollmentService.createEnrollmentRequest - Error:', error);
      throw error;
    }
  },

  async getStudentRequests(studentId: string): Promise<ClassEnrollmentRequest[]> {
    console.log('📚 ClassEnrollmentService.getStudentRequests - Fetching requests for student:', studentId);
    
    try {
      const { data, error } = await supabase
        .from('class_enrollment_requests')
        .select(`
          *,
          classes (*),
          users!class_enrollment_requests_student_id_fkey (id, name, last_name, education_level),
          approver:users!class_enrollment_requests_approved_by_fkey (id, name, last_name)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ClassEnrollmentService.getStudentRequests - Error:', error);
        throw error;
      }

      const requests = data?.map(convertDbRequestToRequest) || [];
      console.log('📊 ClassEnrollmentService.getStudentRequests - Requests count:', requests.length);
      return requests;
    } catch (error) {
      console.error('❌ ClassEnrollmentService.getStudentRequests - Error:', error);
      throw error;
    }
  },

  async getAllPendingRequests(): Promise<ClassEnrollmentRequest[]> {
    console.log('📚 ClassEnrollmentService.getAllPendingRequests - Fetching all pending requests');
    
    try {
      const { data, error } = await supabase
        .from('class_enrollment_requests')
        .select(`
          *,
          classes (*),
          users!class_enrollment_requests_student_id_fkey (id, name, last_name, education_level),
          approver:users!class_enrollment_requests_approved_by_fkey (id, name, last_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ClassEnrollmentService.getAllPendingRequests - Error:', error);
        throw error;
      }

      const requests = data?.map(convertDbRequestToRequest) || [];
      console.log('📊 ClassEnrollmentService.getAllPendingRequests - Pending requests count:', requests.length);
      return requests;
    } catch (error) {
      console.error('❌ ClassEnrollmentService.getAllPendingRequests - Error:', error);
      throw error;
    }
  },

  async approveEnrollmentRequest(requestId: string, adminId: string, adminNotes?: string): Promise<void> {
    console.log('✅ ClassEnrollmentService.approveEnrollmentRequest - Approving request:', requestId);
    
    try {
      // Get request details first
      const { data: request, error: fetchError } = await supabase
        .from('class_enrollment_requests')
        .select(`
          *,
          classes (*),
          users!class_enrollment_requests_student_id_fkey (id, name, last_name)
        `)
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        throw new Error('Request not found');
      }

      // Check if class is full
      if (request.classes.current_students >= request.classes.max_students) {
        throw new Error('Class is full');
      }

      // Check if student is already enrolled
      if (request.classes.enrolled_students?.includes(request.student_id)) {
        throw new Error('Student is already enrolled in this class');
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('class_enrollment_requests')
        .update({
          status: 'approved',
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('❌ ClassEnrollmentService.approveEnrollmentRequest - Error:', updateError);
        throw updateError;
      }

      // Enroll student in class
      const updatedEnrolledStudents = [...(request.classes.enrolled_students || []), request.student_id];
      const { error: enrollError } = await supabase
        .from('classes')
        .update({
          enrolled_students: updatedEnrolledStudents,
          current_students: request.classes.current_students + 1
        })
        .eq('id', request.class_id);

      if (enrollError) {
        console.error('❌ ClassEnrollmentService.approveEnrollmentRequest - Enroll error:', enrollError);
        throw enrollError;
      }

      console.log('✅ ClassEnrollmentService.approveEnrollmentRequest - Request approved successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'student_enrolled',
          title: 'Class Enrollment Approved',
          description: `${request.users.name} ${request.users.last_name} was enrolled in ${request.classes.name}`,
          userId: adminId,
          targetId: requestId,
          targetType: 'class',
          metadata: { 
            className: request.classes.name,
            studentName: `${request.users.name} ${request.users.last_name}`
          }
        });
      } catch (activityError) {
        console.warn('⚠️ ClassEnrollmentService.approveEnrollmentRequest - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ ClassEnrollmentService.approveEnrollmentRequest - Error:', error);
      throw error;
    }
  },

  async rejectEnrollmentRequest(requestId: string, adminId: string, adminNotes?: string): Promise<void> {
    console.log('❌ ClassEnrollmentService.rejectEnrollmentRequest - Rejecting request:', requestId);
    
    try {
      // Get request details first
      const { data: request, error: fetchError } = await supabase
        .from('class_enrollment_requests')
        .select(`
          *,
          classes (*),
          users!class_enrollment_requests_student_id_fkey (id, name, last_name)
        `)
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        throw new Error('Request not found');
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('class_enrollment_requests')
        .update({
          status: 'rejected',
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('❌ ClassEnrollmentService.rejectEnrollmentRequest - Error:', updateError);
        throw updateError;
      }

      console.log('✅ ClassEnrollmentService.rejectEnrollmentRequest - Request rejected successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'student_unenrolled',
          title: 'Class Enrollment Rejected',
          description: `${request.users.name} ${request.users.last_name}'s request to join ${request.classes.name} was rejected`,
          userId: adminId,
          targetId: requestId,
          targetType: 'class',
          metadata: { 
            className: request.classes.name,
            studentName: `${request.users.name} ${request.users.last_name}`,
            reason: adminNotes
          }
        });
      } catch (activityError) {
        console.warn('⚠️ ClassEnrollmentService.rejectEnrollmentRequest - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ ClassEnrollmentService.rejectEnrollmentRequest - Error:', error);
      throw error;
    }
  }
};