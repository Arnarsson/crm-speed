export interface Contact {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  company?: string
  position?: string
  tags: string[]
  notes?: string
  engagement_score: number
  last_contact?: string
  next_followup?: string
  created_at: string
  updated_at: string
}

export interface Relationship {
  id: string
  contact_a_id: string
  contact_b_id: string
  relationship_type: string
  strength: number
  notes?: string
  created_at: string
}

export interface Deal {
  id: string
  user_id: string
  contact_id?: string
  title: string
  value?: number
  currency: string
  stage: string
  probability: number
  expected_close?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  contact_id?: string
  deal_id?: string
  type: 'email' | 'call' | 'meeting' | 'note'
  content?: string
  completed: boolean
  due_date?: string
  created_at: string
}