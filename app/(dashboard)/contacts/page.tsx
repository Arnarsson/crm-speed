'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Contact } from '@/types/database'
import { Plus, Search, Edit2, Trash2, Mail, Phone, Upload, Linkedin, ChevronDown } from 'lucide-react'
import { ContactModal } from '@/components/ContactModal'
import { ImportContacts } from '@/components/ImportContacts'
import { LinkedInImport } from '@/components/LinkedInImport'
import { BulkActions } from '@/components/BulkActions'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isLinkedInImportOpen, setIsLinkedInImportOpen] = useState(false)
  const [showImportDropdown, setShowImportDropdown] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  useEffect(() => {
    loadContacts()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowImportDropdown(false)
    }
    
    if (showImportDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showImportDropdown])

  const loadContacts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setContacts(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (!error) {
        loadContacts()
      }
    }
  }

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedContact(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedContact(null)
    loadContacts()
  }

  const handleSelectContact = (contactId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedContacts(prev => [...prev, contactId])
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId))
    }
  }

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedContacts(filteredContacts.map(contact => contact.id))
    } else {
      setSelectedContacts([])
    }
  }

  const clearSelection = () => {
    setSelectedContacts([])
  }

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase()
    return (
      contact.first_name.toLowerCase().includes(searchLower) ||
      contact.last_name.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower) ||
      contact.position?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Contacts
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            {/* Import dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowImportDropdown(!showImportDropdown)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              
              {showImportDropdown && (
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsImportOpen(true)
                        setShowImportDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Upload className="h-4 w-4 mr-3" />
                      Import from CSV
                    </button>
                    <button
                      onClick={() => {
                        setIsLinkedInImportOpen(true)
                        setShowImportDropdown(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Linkedin className="h-4 w-4 mr-3 text-blue-600" />
                      Import from LinkedIn
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search contacts..."
            />
          </div>
        </div>

        <BulkActions
          selectedContacts={selectedContacts}
          onSuccess={loadContacts}
          onClearSelection={clearSelection}
        />

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new contact.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {/* Select all header */}
              {filteredContacts.length > 0 && (
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === filteredContacts.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Select all {filteredContacts.length} contacts
                    </span>
                  </label>
                </div>
              )}
              
              <ul className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <li key={contact.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                          />
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {contact.first_name[0]}{contact.last_name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.first_name} {contact.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contact.position && `${contact.position} at `}
                              {contact.company}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <Mail className="h-5 w-5" />
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <Phone className="h-5 w-5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleEdit(contact)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      {contact.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {contact.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ContactModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        contact={selectedContact}
      />
      
      <ImportContacts
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={loadContacts}
      />
      
      <LinkedInImport
        isOpen={isLinkedInImportOpen}
        onClose={() => setIsLinkedInImportOpen(false)}
        onSuccess={loadContacts}
      />
    </div>
  )
}