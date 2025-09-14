/*
  # Fix RLS policies for book_requests table

  1. Security Changes
    - Drop all existing policies that may be conflicting
    - Create simple, clear policies for book requests
    - Allow authenticated users to create requests for themselves
    - Allow users to read their own requests
    - Allow admins to manage all requests

  2. Policy Structure
    - INSERT: Users can create requests where user_id matches auth.uid()
    - SELECT: Users can read their own requests, admins can read all
    - UPDATE: Users can update their pending requests, admins can update all
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to create requests" ON book_requests;
DROP POLICY IF EXISTS "Users can read own requests" ON book_requests;
DROP POLICY IF EXISTS "Users can update own pending requests" ON book_requests;
DROP POLICY IF EXISTS "Admins can read all requests" ON book_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON book_requests;
DROP POLICY IF EXISTS "Allow users to create book requests" ON book_requests;
DROP POLICY IF EXISTS "Allow users to read own book requests" ON book_requests;
DROP POLICY IF EXISTS "Allow users to update own pending book requests" ON book_requests;
DROP POLICY IF EXISTS "Allow admins to read all book requests" ON book_requests;
DROP POLICY IF EXISTS "Allow admins to update all book requests" ON book_requests;

-- Ensure RLS is enabled
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy - allow authenticated users to create requests for themselves
CREATE POLICY "Users can create own requests"
  ON book_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create SELECT policy - users can read their own requests
CREATE POLICY "Users can read own requests"
  ON book_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create SELECT policy - admins can read all requests
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

-- Create UPDATE policy - users can update their own pending requests
CREATE POLICY "Users can update own pending requests"
  ON book_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy - admins can update all requests
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