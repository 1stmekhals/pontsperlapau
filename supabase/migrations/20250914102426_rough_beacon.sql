/*
  # Fix RLS policies for book requests

  1. Security Changes
    - Drop existing restrictive policies
    - Add comprehensive policies for all user roles
    - Allow staff, students, and visitors to create requests
    - Allow users to read their own requests
    - Allow admins to manage all requests

  2. Policies Added
    - INSERT: Allow authenticated users to create requests for themselves
    - SELECT: Allow users to read their own requests + admins read all
    - UPDATE: Allow users to update their pending requests + admins update all
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can create their own requests" ON book_requests;
DROP POLICY IF EXISTS "Users can read their own requests" ON book_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON book_requests;
DROP POLICY IF EXISTS "Admins can read all requests" ON book_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON book_requests;

-- Enable RLS if not already enabled
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create requests for themselves
CREATE POLICY "Allow authenticated users to create requests"
  ON book_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    status = 'pending'::request_status
  );

-- Allow users to read their own requests
CREATE POLICY "Users can read own requests"
  ON book_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to read all requests
CREATE POLICY "Admins can read all requests"
  ON book_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'::user_role 
      AND users.status = 'approved'::user_status
    )
  );

-- Allow users to update their own pending requests
CREATE POLICY "Users can update own pending requests"
  ON book_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    status = 'pending'::request_status
  )
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to update all requests
CREATE POLICY "Admins can update all requests"
  ON book_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'::user_role 
      AND users.status = 'approved'::user_status
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'::user_role 
      AND users.status = 'approved'::user_status
    )
  );