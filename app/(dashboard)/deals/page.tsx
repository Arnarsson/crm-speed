'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Deal, Contact } from '@/types/database'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, DollarSign, Calendar, User } from 'lucide-react'
import { DealModal } from '@/components/DealModal'

const STAGES = [
  { id: 'lead', name: 'Leads', color: 'bg-gray-100' },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-100' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-100' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100' },
  { id: 'won', name: 'Won', color: 'bg-green-100' },
  { id: 'lost', name: 'Lost', color: 'bg-red-100' },
]

export default function DealsPage() {
  const [deals, setDeals] = useState<(Deal & { contact?: Contact })[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    const [dealsResult, contactsResult] = await Promise.all([
      supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(*)
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('contacts')
        .select('*')
        .order('first_name')
    ])

    if (!dealsResult.error && dealsResult.data) {
      setDeals(dealsResult.data)
    }

    if (!contactsResult.error && contactsResult.data) {
      setContacts(contactsResult.data)
    }

    setLoading(false)
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const dealId = result.draggableId
    const newStage = result.destination.droppableId

    const { error } = await supabase
      .from('deals')
      .update({ stage: newStage })
      .eq('id', dealId)

    if (!error) {
      setDeals(deals.map(deal => 
        deal.id === dealId ? { ...deal, stage: newStage } : deal
      ))
    }
  }

  const handleCreateDeal = () => {
    setSelectedDeal(null)
    setIsModalOpen(true)
  }

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDeal(null)
    loadData()
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '0 DKK'
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getStageDeals = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId)
  }

  const getTotalValue = (stageId: string) => {
    return getStageDeals(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0)
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Deals Pipeline
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleCreateDeal}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deal
            </button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {STAGES.map((stage) => {
                  const stageDeals = getStageDeals(stage.id)
                  const totalValue = getTotalValue(stage.id)

                  return (
                    <div key={stage.id} className="flex-shrink-0 w-80">
                      <div className={`rounded-lg ${stage.color} p-4`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                          <div className="text-sm text-gray-600">
                            {stageDeals.length} deals
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          Total: {formatCurrency(totalValue)}
                        </div>

                        <Droppable droppableId={stage.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-[200px] space-y-3 ${
                                snapshot.isDraggingOver ? 'bg-blue-50' : ''
                              }`}
                            >
                              {stageDeals.map((deal, index) => (
                                <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                                        snapshot.isDragging ? 'shadow-lg' : ''
                                      }`}
                                      onClick={() => handleEditDeal(deal)}
                                    >
                                      <h4 className="font-medium text-gray-900 mb-2">{deal.title}</h4>
                                      
                                      <div className="space-y-2 text-sm text-gray-600">
                                        {deal.contact && (
                                          <div className="flex items-center">
                                            <User className="h-4 w-4 mr-1" />
                                            {deal.contact.first_name} {deal.contact.last_name}
                                          </div>
                                        )}
                                        
                                        <div className="flex items-center">
                                          <DollarSign className="h-4 w-4 mr-1" />
                                          {formatCurrency(deal.value)}
                                        </div>
                                        
                                        {deal.expected_close && (
                                          <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(deal.expected_close).toLocaleDateString()}
                                          </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {deal.probability}% probability
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  )
                })}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      <DealModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        deal={selectedDeal}
        contacts={contacts}
      />
    </div>
  )
}