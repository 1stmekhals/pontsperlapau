import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity } from '../types';

interface ActivityContextType {
  activities: Activity[];
  loading: boolean;
  fetchActivities: (options?: { limit?: number }) => Promise<void>;
  createActivity: (activityData: Partial<Activity>) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async (options?: { limit?: number }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: Partial<Activity>) => {
    try {
      const { error } = await supabase
        .from('activities')
        .insert([activityData]);

      if (error) throw error;
      await fetchActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  };

  const value = {
    activities,
    loading,
    fetchActivities,
    createActivity,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}