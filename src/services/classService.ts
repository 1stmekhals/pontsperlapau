import { supabase } from '../lib/supabase';
import { Class } from '../types/Class';
import { activityService } from './activityService';

// Helper function to convert database class to application Class type
const convertDbClassToClass = (dbClass: any): Class => ({
  id: dbClass.id,
  name: dbClass.name,
  description: dbClass.description,
  subject: dbClass.subject,
  level: dbClass.level,
  teacherId: dbClass.teacher_id,
  schedule: dbClass.schedule || [],
  maxStudents: dbClass.max_students,
  currentStudents: dbClass.current_students,
  enrolledStudents: dbClass.enrolled_students || [],
  status: dbClass.status,
  startDate: dbClass.start_date,
  endDate: dbClass.end_date,
  createdAt: dbClass.created_at,
  updatedAt: dbClass.updated_at,
  teacher: dbClass.teacher ? {
    id: dbClass.teacher.id,
    name: dbClass.teacher.name,
    lastName: dbClass.teacher.last_name,
    jobTitle: dbClass.teacher.job_title
  } : undefined,
  students: dbClass.students ? dbClass.students.map((student: any) => ({
    id: student.id,
    name: student.name,
    lastName: student.last_name,
    educationLevel: student.education_level
  })) : undefined
});

// Helper function to convert application Class to database format
const convertClassToDbClass = (classData: Partial<Class>) => ({
  name: classData.name,
  description: classData.description,
  subject: classData.subject,
  level: classData.level,
  teacher_id: classData.teacherId,
  schedule: classData.schedule || [],
  max_students: classData.maxStudents,
  current_students: classData.currentStudents || 0,
  enrolled_students: classData.enrolledStudents || [],
  status: classData.status,
  start_date: classData.startDate,
  end_date: classData.endDate
});

export const classService = {
  async getAllClasses(): Promise<Class[]> {
    console.log('📚 ClassService.getAllClasses - Fetching all classes');
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teacher:users!classes_teacher_id_fkey (id, name, last_name, job_title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ ClassService.getAllClasses - Error:', error);
        throw error;
      }

      const classes = data?.map(convertDbClassToClass) || [];
      console.log('📊 ClassService.getAllClasses - Classes count:', classes.length);
      return classes;
    } catch (error) {
      console.error('❌ ClassService.getAllClasses - Error:', error);
      throw error;
    }
  },

  async createClass(classData: Partial<Class>, adminId: string): Promise<void> {
    console.log('➕ ClassService.createClass - Creating class');
    
    try {
      const dbClassData = convertClassToDbClass(classData);
      
      const { data: newClass, error } = await supabase
        .from('classes')
        .insert([dbClassData])
        .select()
        .single();

      if (error) {
        console.error('❌ ClassService.createClass - Error:', error);
        throw error;
      }

      console.log('✅ ClassService.createClass - Class created successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'class_created',
          title: 'Class Created',
          description: `${classData.name} (${classData.subject}) was created`,
          userId: adminId,
          targetId: newClass.id,
          targetType: 'class',
          metadata: { 
            className: classData.name,
            subject: classData.subject,
            level: classData.level
          }
        });
      } catch (activityError) {
        console.warn('⚠️ ClassService.createClass - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ ClassService.createClass - Error:', error);
      throw error;
    }
  },

  async updateClass(classId: string, classData: Partial<Class>, adminId: string): Promise<void> {
    console.log('✏️ ClassService.updateClass - Updating class:', classId);
    
    try {
      const dbClassData = convertClassToDbClass(classData);
      
      const { error } = await supabase
        .from('classes')
        .update(dbClassData)
        .eq('id', classId);

      if (error) {
        console.error('❌ ClassService.updateClass - Error:', error);
        throw error;
      }

      console.log('✅ ClassService.updateClass - Class updated successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'class_updated',
          title: 'Class Updated',
          description: `Class ${classData.name} was updated`,
          userId: adminId,
          targetId: classId,
          targetType: 'class',
          metadata: { changes: Object.keys(classData) }
        });
      } catch (activityError) {
        console.warn('⚠️ ClassService.updateClass - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ ClassService.updateClass - Error:', error);
      throw error;
    }
  },

  async deleteClass(classId: string, adminId: string): Promise<void> {
    console.log('🗑️ ClassService.deleteClass - Deleting class:', classId);
    
    try {
      // Get class details first
      const { data: classData, error: fetchError } = await supabase
        .from('classes')
        .select('name, subject')
        .eq('id', classId)
        .single();

      if (fetchError || !classData) {
        throw new Error('Class not found');
      }

      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) {
        console.error('❌ ClassService.deleteClass - Error:', error);
        throw error;
      }

      console.log('✅ ClassService.deleteClass - Class deleted successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'class_deleted',
          title: 'Class Deleted',
          description: `${classData.name} (${classData.subject}) was deleted`,
          userId: adminId,
          targetId: classId,
          targetType: 'class',
          metadata: { 
            className: classData.name,
            subject: classData.subject
          }
        });
      } catch (activityError) {
        console.warn('⚠️ ClassService.deleteClass - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ ClassService.deleteClass - Error:', error);
      throw error;
    }
  },

  async enrollStudent(classId: string, studentId: string, adminId: string): Promise<void> {
    console.log('👨‍🎓 ClassService.enrollStudent - Enrolling student:', studentId, 'in class:', classId);
    
    try {
      // Get current class data
      const { data: currentClass, error: fetchError } = await supabase
        .from('classes')
        .select('enrolled_students, current_students, max_students, name')
        .eq('id', classId)
        .single();

      if (fetchError) throw fetchError;

      const enrolledStudents = currentClass.enrolled_students || [];
      
      // Check if student is already enrolled
      if (enrolledStudents.includes(studentId)) {
        throw new Error('Student already enrolled');
      }

      // Check if class is full
      if (currentClass.current_students >= currentClass.max_students) {
        throw new Error('Class is full');
      }

      // Add student to enrolled list
      const updatedEnrolledStudents = [...enrolledStudents, studentId];

      const { error } = await supabase
        .from('classes')
        .update({
          enrolled_students: updatedEnrolledStudents,
          current_students: updatedEnrolledStudents.length
        })
        .eq('id', classId);

      if (error) throw error;

      console.log('✅ ClassService.enrollStudent - Student enrolled successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'student_enrolled',
          title: 'Student Enrolled',
          description: `Student was enrolled in ${currentClass.name}`,
          userId: adminId,
          targetId: classId,
          targetType: 'class',
          metadata: { 
            className: currentClass.name,
            studentId: studentId
          }
        });
      } catch (activityError) {
        console.warn('⚠️ ClassService.enrollStudent - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ ClassService.enrollStudent - Error:', error);
      throw error;
    }
  },

  async unenrollStudent(classId: string, studentId: string, adminId: string): Promise<void> {
    console.log('👨‍🎓 ClassService.unenrollStudent - Unenrolling student:', studentId, 'from class:', classId);
    
    try {
      // Get current class data
      const { data: currentClass, error: fetchError } = await supabase
        .from('classes')
        .select('enrolled_students, name')
        .eq('id', classId)
        .single();

      if (fetchError) throw fetchError;

      const enrolledStudents = currentClass.enrolled_students || [];
      
      // Remove student from enrolled list
      const updatedEnrolledStudents = enrolledStudents.filter((id: string) => id !== studentId);

      const { error } = await supabase
        .from('classes')
        .update({
          enrolled_students: updatedEnrolledStudents,
          current_students: updatedEnrolledStudents.length
        })
        .eq('id', classId);

      if (error) throw error;

      console.log('✅ ClassService.unenrollStudent - Student unenrolled successfully');

      // Log activity
      try {
        await activityService.logActivity({
          type: 'student_unenrolled',
          title: 'Student Unenrolled',
          description: `Student was unenrolled from ${currentClass.name}`,
          userId: adminId,
          targetId: classId,
          targetType: 'class',
          metadata: { 
            className: currentClass.name,
            studentId: studentId
          }
        });
      } catch (activityError) {
        console.warn('⚠️ ClassService.unenrollStudent - Activity logging failed:', activityError);
      }
    } catch (error) {
      console.error('❌ ClassService.unenrollStudent - Error:', error);
      throw error;
    }
  }
};