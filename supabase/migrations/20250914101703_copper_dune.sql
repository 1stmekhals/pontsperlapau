/*
  # Create book requests table

  1. New Tables
    - `book_requests`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key to books)
      - `user_id` (uuid, foreign key to users)
      - `request_date` (date)
      - `requested_due_date` (date)
      - `status` (enum: pending, approved, rejected)
      - `notes` (text, optional user notes)
      - `admin_notes` (text, optional admin notes)
      - `approved_by` (uuid, foreign key to users)
      - `approved_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `book_requests` table
    - Add policies for users to manage their own requests
    - Add policies for admins to manage all requests
*/

-- Create enum for request status
DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create book_requests table
CREATE TABLE IF NOT EXISTS book_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_date date DEFAULT CURRENT_DATE,
  requested_due_date date NOT NULL,
  status request_status DEFAULT 'pending',
  notes text,
  admin_notes text,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own requests"
  ON book_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
  ON book_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can update their own pending requests"
  ON book_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all requests"
  ON book_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.status = 'approved'
    )
  );

CREATE POLICY "Admins can update all requests"
  ON book_requests
  FOR UPDATE
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS book_requests_user_id_idx ON book_requests(user_id);
CREATE INDEX IF NOT EXISTS book_requests_book_id_idx ON book_requests(book_id);
CREATE INDEX IF NOT EXISTS book_requests_status_idx ON book_requests(status);
CREATE INDEX IF NOT EXISTS book_requests_created_at_idx ON book_requests(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_book_requests_updated_at
  BEFORE UPDATE ON book_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();