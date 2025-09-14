/*
  # Fix RLS policies for book_requests table

  1. Security Updates
    - Enable RLS on book_requests table
    - Add policy for staff to create requests
    - Add policy for admins to manage requests
    - Add policy for users to read their own requests

  2. Changes
    - Enable row level security
    - Create INSERT policy for authenticated users to create their own requests
    - Create SELECT policy for users to read their own requests
    - Create SELECT/UPDATE policies for admins to manage all requests
*/

-- Enable RLS on book_requests table
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create their own requests
CREATE POLICY "Users can create their own requests"
  ON book_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (uid() = user_id AND status = 'pending'::request_status);

-- Allow users to read their own requests
CREATE POLICY "Users can read their own requests"
  ON book_requests
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

-- Allow users to update their own pending requests
CREATE POLICY "Users can update their own pending requests"
  ON book_requests
  FOR UPDATE
  TO authenticated
  USING (uid() = user_id AND status = 'pending'::request_status)
  WITH CHECK (uid() = user_id);

-- Allow admins to read all requests
CREATE POLICY "Admins can read all requests"
  ON book_requests
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = uid()
    AND users.role = 'admin'::user_role
    AND users.status = 'approved'::user_status
  ));

-- Allow admins to update all requests
CREATE POLICY "Admins can update all requests"
  ON book_requests
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = uid()
    AND users.role = 'admin'::user_role
    AND users.status = 'approved'::user_status
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = uid()
    AND users.role = 'admin'::user_role
    AND users.status = 'approved'::user_status
  ));