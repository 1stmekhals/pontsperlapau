/*
  # Create class enrollment requests table

  1. New Tables
    - `class_enrollment_requests`
      - `id` (uuid, primary key)
      - `class_id` (uuid, foreign key to classes)
      - `student_id` (uuid, foreign key to users)
      - `request_date` (date, default today)
      - `status` (enum: pending, approved, rejected)
      - `notes` (text, optional student notes)
      - `admin_notes` (text, optional admin notes)
      - `approved_by` (uuid, foreign key to users)
      - `approved_at` (timestamp, when approved/rejected)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `class_enrollment_requests` table
    - Add policies for students to create and read their own requests
    - Add policies for admins and staff to manage all requests

  3. Indexes
    - Index on class_id for efficient class-based queries
    - Index on student_id for efficient student-based queries
    - Index on status for filtering pending requests
    - Unique constraint on (class_id, student_id) to prevent duplicate requests
*/

-- Create enum for request status if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_request_status') THEN
    CREATE TYPE enrollment_request_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- Create class enrollment requests table
CREATE TABLE IF NOT EXISTS class_enrollment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_date date DEFAULT CURRENT_DATE,
  status enrollment_request_status DEFAULT 'pending',
  notes text,
  admin_notes text,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Prevent duplicate requests
  UNIQUE(class_id, student_id)
);

-- Enable RLS
ALTER TABLE class_enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS class_enrollment_requests_class_id_idx ON class_enrollment_requests(class_id);
CREATE INDEX IF NOT EXISTS class_enrollment_requests_student_id_idx ON class_enrollment_requests(student_id);
CREATE INDEX IF NOT EXISTS class_enrollment_requests_status_idx ON class_enrollment_requests(status);
CREATE INDEX IF NOT EXISTS class_enrollment_requests_created_at_idx ON class_enrollment_requests(created_at DESC);

-- Create RLS policies
CREATE POLICY "Students can create enrollment requests"
  ON class_enrollment_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = uid() AND role = 'student' AND status = 'approved'
    )
  );

CREATE POLICY "Students can read their own requests"
  ON class_enrollment_requests
  FOR SELECT
  TO authenticated
  USING (student_id = uid());

CREATE POLICY "Admins can manage all enrollment requests"
  ON class_enrollment_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = uid() AND role = 'admin' AND status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = uid() AND role = 'admin' AND status = 'approved'
    )
  );

CREATE POLICY "Staff can read all enrollment requests"
  ON class_enrollment_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = uid() AND role IN ('staff', 'admin') AND status = 'approved'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_class_enrollment_requests_updated_at
  BEFORE UPDATE ON class_enrollment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();