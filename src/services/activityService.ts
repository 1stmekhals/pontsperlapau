import { supabase } from '../lib/supabase';
import { Activity } from '../types';

export const activityService = {
  async logActivity(activityData: {
    type: string;
    title: string;
    description: string;
    userId: string;
    targetId?: string;
    targetType?: string;
    metadata?: any;
  }): Promise<void> {
    console.log('📝 ActivityService.logActivity - Logging activity:', activityData);
    
    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          type: activityData.type,
          title: activityData.title,
          description: activityData.description,
          user_id: activityData.userId,
          target_id: activityData.targetId,
          target_type: activityData.targetType,
          metadata: activityData.metadata
        });

      if (error) {
        console.error('❌ ActivityService.logActivity - Error:', error);
        throw error;
      }

      console.log('✅ ActivityService.logActivity - Activity logged successfully');
    } catch (error) {
      console.error('❌ ActivityService.logActivity - Error:', error);
      // Don't throw the error to prevent breaking the main functionality
      // Activity logging is supplementary and shouldn't break core features
    }
  },

  async getActivities(options?: { limit?: number }): Promise<Activity[]> {
    console.log('📊 ActivityService.getActivities - Fetching activities');
    
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ ActivityService.getActivities - Error:', error);
        throw error;
      }

      console.log('📊 ActivityService.getActivities - Activities count:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ ActivityService.getActivities - Error:', error);
      return [];
    }
  }
};