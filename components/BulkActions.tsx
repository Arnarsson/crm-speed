'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, Tag, Mail, Download } from 'lucide-react'

interface BulkActionsProps {
  selectedContacts: string[]
  onSuccess: () => void
  onClearSelection: () => void
}

export function BulkActions({ selectedContacts, onSuccess, onClearSelection }: BulkActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTag, setNewTag] = useState('')

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedContacts.length} contacts? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', selectedContacts)

      if (error) throw error

      onSuccess()
      onClearSelection()
    } catch (error: any) {
      alert(`Error deleting contacts: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAddTag = async () => {
    if (!newTag.trim()) return

    setLoading(true)
    try {
      // Get current contacts to merge tags
      const { data: contacts, error: fetchError } = await supabase
        .from('contacts')
        .select('id, tags')
        .in('id', selectedContacts)

      if (fetchError) throw fetchError

      // Update each contact with the new tag
      const updates = contacts.map(contact => ({
        id: contact.id,
        tags: [...(contact.tags || []), newTag.trim()].filter((tag, index, arr) => arr.indexOf(tag) === index)
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('contacts')
          .update({ tags: update.tags })
          .eq('id', update.id)

        if (error) throw error
      }

      setNewTag('')
      setShowTagInput(false)
      onSuccess()
      onClearSelection()
    } catch (error: any) {
      alert(`Error adding tags: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleExportContacts = async () => {
    setLoading(true)
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .in('id', selectedContacts)

      if (error) throw error

      // Convert to CSV
      const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Position', 'Tags', 'Notes']
      const csvContent = [
        headers.join(','),
        ...contacts.map(contact => [
          contact.first_name,
          contact.last_name,
          contact.email || '',
          contact.phone || '',
          contact.company || '',
          contact.position || '',
          (contact.tags || []).join(';'),
          contact.notes || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onClearSelection()
    } catch (error: any) {
      alert(`Error exporting contacts: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (selectedContacts.length === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-blue-900">
            {selectedContacts.length} contact{selectedContacts.length === 1 ? '' : 's'} selected
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTagInput(!showTagInput)}
            disabled={loading}
            className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-sm font-medium rounded text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50"
          >
            <Tag className="h-4 w-4 mr-1" />
            Add Tag
          </button>
          
          <button
            onClick={handleExportContacts}
            disabled={loading}
            className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-sm font-medium rounded text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          
          <button
            onClick={handleBulkDelete}
            disabled={loading}
            className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
          
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        </div>
      </div>
      
      {showTagInput && (
        <div className="mt-3 flex items-center space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter tag name"
            className="flex-1 text-sm border border-blue-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleBulkAddTag()}
          />
          <button
            onClick={handleBulkAddTag}
            disabled={loading || !newTag.trim()}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  )
}