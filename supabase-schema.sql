-- Complete CRM Schema for Supabase
-- Run this entire file in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts table
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  engagement_score INTEGER DEFAULT 0,
  last_contact TIMESTAMPTZ,
  next_followup TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships table for network mapping
CREATE TABLE relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_a_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  contact_b_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'professional',
  strength INTEGER DEFAULT 5 CHECK (strength BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_a_id, contact_b_id)
);

-- Deals/Pipeline table
CREATE TABLE deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  title TEXT NOT NULL,
  value DECIMAL(12,2),
  currency TEXT DEFAULT 'DKK',
  stage TEXT DEFAULT 'lead',
  probability INTEGER DEFAULT 20,
  expected_close DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  type TEXT NOT NULL, -- 'email', 'call', 'meeting', 'note'
  content TEXT,
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own deals" ON deals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own activities" ON activities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own relationships" ON relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE id IN (contact_a_id, contact_b_id) 
      AND user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_deals_user_stage ON deals(user_id, stage);
CREATE INDEX idx_activities_user_date ON activities(user_id, due_date);
CREATE INDEX idx_relationships_contacts ON relationships(contact_a_id, contact_b_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for dashboard stats
CREATE VIEW dashboard_stats AS
SELECT 
  user_id,
  COUNT(DISTINCT c.id) as total_contacts,
  COUNT(DISTINCT d.id) as total_deals,
  COUNT(DISTINCT d.id) FILTER (WHERE d.stage = 'won') as won_deals,
  COUNT(DISTINCT d.id) FILTER (WHERE d.stage NOT IN ('won', 'lost')) as active_deals,
  COALESCE(SUM(d.value) FILTER (WHERE d.stage = 'won'), 0) as won_revenue,
  COALESCE(SUM(d.value) FILTER (WHERE d.stage NOT IN ('won', 'lost')), 0) as pipeline_value,
  COUNT(DISTINCT a.id) FILTER (WHERE a.completed = false AND a.due_date < NOW()) as overdue_activities
FROM auth.users u
LEFT JOIN contacts c ON u.id = c.user_id
LEFT JOIN deals d ON u.id = d.user_id
LEFT JOIN activities a ON u.id = a.user_id
GROUP BY u.id;

-- Grant access to the view
GRANT SELECT ON dashboard_stats TO authenticated;