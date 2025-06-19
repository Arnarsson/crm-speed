'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Linkedin, Copy, CheckCircle, ExternalLink, Users } from 'lucide-react'

interface LinkedInImportProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LinkedInImport({ isOpen, onClose, onSuccess }: LinkedInImportProps) {
  const [step, setStep] = useState<'instructions' | 'manual' | 'success'>('instructions')
  const [importing, setImporting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    position: '',
    linkedin_url: '',
    notes: ''
  })

  const bookmarkletCode = `javascript:(function(){
    const profile = {
      first_name: document.querySelector('h1')?.textContent?.split(' ')[0] || '',
      last_name: document.querySelector('h1')?.textContent?.split(' ').slice(1).join(' ') || '',
      company: document.querySelector('.text-body-medium.break-words')?.textContent?.trim() || '',
      position: document.querySelector('.text-body-medium.break-words')?.previousElementSibling?.textContent?.trim() || '',
      linkedin_url: window.location.href.split('?')[0],
      notes: 'Imported from LinkedIn'
    };
    const params = new URLSearchParams(profile);
    window.open('${typeof window !== 'undefined' ? window.location.origin : ''}/contacts/import-linkedin?' + params.toString(), '_blank');
  })();`

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode)
    alert('Bookmarklet copied! Add it as a bookmark in your browser.')
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setImporting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Not authenticated')
      setImporting(false)
      return
    }

    try {
      const contactData = {
        ...formData,
        user_id: user.id,
        tags: ['LinkedIn Import'],
        lead_source: 'LinkedIn'
      }

      const { error } = await supabase
        .from('contacts')
        .insert([contactData])

      if (error) throw error

      setStep('success')
      onSuccess()
    } catch (error: any) {
      alert(`Error importing contact: ${error.message}`)
    } finally {
      setImporting(false)
    }
  }

  const resetForm = () => {
    setStep('instructions')
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      company: '',
      position: '',
      linkedin_url: '',
      notes: ''
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <Linkedin className="h-5 w-5 mr-2 text-blue-600" />
                LinkedIn Import
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {step === 'instructions' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">LinkedIn Import Options</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        Choose one of the methods below to import contacts from LinkedIn
                      </div>
                    </div>
                  </div>
                </div>

                {/* Method 1: Bookmarklet */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">Recommended</span>
                    Browser Bookmarklet (Fast)
                  </h4>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Add this bookmarklet to your browser and click it while viewing any LinkedIn profile to instantly import the contact.
                    </p>
                    
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <code className="text-xs text-gray-800 break-all">
                          LinkedIn → CRM Import
                        </code>
                        <button
                          onClick={copyBookmarklet}
                          className="ml-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Setup:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Copy the bookmarklet above</li>
                        <li>Create a new bookmark in your browser</li>
                        <li>Paste the copied code as the URL</li>
                        <li>Name it "LinkedIn → CRM Import"</li>
                      </ol>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Usage:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Go to any LinkedIn profile</li>
                        <li>Click your bookmarklet</li>
                        <li>Contact will be automatically imported</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Method 2: Manual Entry */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Manual Entry</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Manually enter contact information from LinkedIn profiles.
                  </p>
                  <button
                    onClick={() => setStep('manual')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Add Contact Manually
                  </button>
                </div>

                {/* Method 3: Chrome Extension (Future) */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <h4 className="text-md font-medium text-gray-500 mb-3">Chrome Extension (Coming Soon)</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    A dedicated Chrome extension for one-click LinkedIn imports will be available soon.
                  </p>
                  <button
                    disabled
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Coming Soon
                  </button>
                </div>
              </div>
            )}

            {step === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Additional notes about this contact..."
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('instructions')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={importing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? 'Importing...' : 'Import Contact'}
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Contact Imported Successfully!</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.first_name} {formData.last_name} has been added to your CRM.
                  </p>
                </div>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Import Another
                  </button>
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}