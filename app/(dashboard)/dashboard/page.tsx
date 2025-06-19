'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Contact, Deal } from '@/types/database'
import { TrendingUp, Users, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalContacts: number
  activeDeals: number
  wonDeals: number
  pipelineValue: number
  wonRevenue: number
  recentContacts: Contact[]
  recentDeals: Deal[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    activeDeals: 0,
    wonDeals: 0,
    pipelineValue: 0,
    wonRevenue: 0,
    recentContacts: [],
    recentDeals: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)

    const [contactsResult, dealsResult] = await Promise.all([
      supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(first_name, last_name, company)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    if (contactsResult.data && dealsResult.data) {
      const contacts = contactsResult.data
      const deals = dealsResult.data

      const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage))
      const wonDeals = deals.filter(d => d.stage === 'won')
      
      const pipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
      const wonRevenue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)

      setStats({
        totalContacts: contacts.length,
        activeDeals: activeDeals.length,
        wonDeals: wonDeals.length,
        pipelineValue,
        wonRevenue,
        recentContacts: contacts.slice(0, 5),
        recentDeals: deals.slice(0, 5),
      })
    }

    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back! Here's what's happening with your CRM.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Contacts</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalContacts}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Deals</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeDeals}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pipeline Value</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.pipelineValue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowUpRight className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Won Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.wonRevenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Contacts */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Contacts</h3>
                <Link href="/contacts" className="text-sm text-blue-600 hover:text-blue-500">
                  View all
                </Link>
              </div>
              
              {stats.recentContacts.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first contact.</p>
                  <div className="mt-6">
                    <Link
                      href="/contacts"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Contact
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {stats.recentContacts.map((contact) => (
                      <li key={contact.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {contact.first_name[0]}{contact.last_name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {contact.first_name} {contact.last_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {contact.company || contact.email}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recent Deals */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Deals</h3>
                <Link href="/deals" className="text-sm text-blue-600 hover:text-blue-500">
                  View all
                </Link>
              </div>
              
              {stats.recentDeals.length === 0 ? (
                <div className="text-center py-6">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No deals yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start tracking your sales opportunities.</p>
                  <div className="mt-6">
                    <Link
                      href="/deals"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Deal
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {stats.recentDeals.map((deal) => (
                      <li key={deal.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {deal.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {deal.contact?.first_name} {deal.contact?.last_name} • {formatCurrency(deal.value || 0)}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              deal.stage === 'won' ? 'bg-green-100 text-green-800' :
                              deal.stage === 'lost' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {deal.stage}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}