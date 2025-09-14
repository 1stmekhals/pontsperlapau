/*
  # Create student_feedbacks table

  1. New Tables
    - `student_feedbacks`
      - `id` (uuid, primary key)
      - `class_id` (uuid, foreign key to classes)
      - `student_id` (uuid, foreign key to users)
      - `teacher_id` (uuid, foreign key to users)
      - `score` (enum: basic, intermediate, advanced)
      - `feedback` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `student_feedbacks` table
    - Add policies for teachers to manage feedback for their classes
    - Add policies for admins to manage all feedback
    - Add policies for students to read their own feedback

  3. Indexes
    - Index on class_id for efficient class feedback queries
    - Index on student_id for efficient student feedback queries
    - Index on teacher_id for efficient teacher feedback queries
*/

-- Create score enum type
CREATE TYPE IF NOT EXISTS feedback_score AS ENUM ('basic', 'intermediate', 'advanced');

-- Create student_feedbacks table
CREATE TABLE IF NOT EXISTS student_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score feedback_score NOT NULL DEFAULT 'basic',
  feedback text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE student_feedbacks ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS student_feedbacks_class_id_idx ON student_feedbacks(class_id);
CREATE INDEX IF NOT EXISTS student_feedbacks_student_id_idx ON student_feedbacks(student_id);
CREATE INDEX IF NOT EXISTS student_feedbacks_teacher_id_idx ON student_feedbacks(teacher_id);
CREATE INDEX IF NOT EXISTS student_feedbacks_created_at_idx ON student_feedbacks(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_student_feedbacks_updated_at
  BEFORE UPDATE ON student_feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Teachers can manage feedback for their own classes
CREATE POLICY "Teachers can manage feedback for their classes"
  ON student_feedbacks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = student_feedbacks.class_id
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = student_feedbacks.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Admins can manage all feedback
CREATE POLICY "Admins can manage all feedback"
  ON student_feedbacks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.status = 'approved'
    )
  );

-- Staff can manage all feedback (for admin staff)
CREATE POLICY "Staff can manage all feedback"
  ON student_feedbacks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'staff'
      AND users.status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'staff'
      AND users.status = 'approved'
    )
  );

-- Students can read their own feedback
CREATE POLICY "Students can read their own feedback"
  ON student_feedbacks
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Unique constraint to prevent duplicate feedback per student per class
ALTER TABLE student_feedbacks 
ADD CONSTRAINT unique_student_class_feedback 
UNIQUE (class_id, student_id, teacher_id);