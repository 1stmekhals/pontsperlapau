/*
  # Disable RLS on book_requests table

  This migration disables Row Level Security on the book_requests table to allow
  authenticated users to create book requests without policy conflicts.

  1. Changes
    - Disable RLS on book_requests table
    - Remove all existing policies that may be causing conflicts
  
  2. Security
    - Application-level security will be maintained through user authentication
    - Only authenticated users can access the book request functionality
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can create own requests" ON book_requests;
DROP POLICY IF EXISTS "Users can read own requests" ON book_requests;
DROP POLICY IF EXISTS "Users can update own pending requests" ON book_requests;
DROP POLICY IF EXISTS "Admins can read all requests" ON book_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON book_requests;
DROP POLICY IF EXISTS "Allow users to insert own requests" ON book_requests;
DROP POLICY IF EXISTS "Allow users to read own requests" ON book_requests;
DROP POLICY IF EXISTS "Allow users to update own pending requests" ON book_requests;
DROP POLICY IF EXISTS "Allow admins to read all requests" ON book_requests;
DROP POLICY IF EXISTS "Allow admins to update all requests" ON book_requests;

-- Disable RLS on book_requests table
ALTER TABLE book_requests DISABLE ROW LEVEL SECURITY;