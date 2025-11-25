-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Individual View" ON expenses FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own data
CREATE POLICY "Individual Insert" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
