import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketService, type Ticket } from '../services/ticketService';
import { projectService, type Project } from '../services/projectService';
import { memberService, type Member } from '../services/memberService';
import { KanbanBoard } from '../components/KanbanBoard';
import { toast } from 'react-toastify';

export const ProjectTickets: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('all');
  
  
  const [searchTerm, setSearchTerm] = useState('');
  const [labelSearchTerm, setLabelSearchTerm] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

 
  const allLabels = Array.from(new Set(tickets.flatMap(ticket => ticket.labels || [])));
  const allPriorities = ['LOW', 'MEDIUM', 'HIGH'];
  
  

 
  const filteredLabels = allLabels.filter(label => 
    label.toLowerCase().includes(labelSearchTerm.toLowerCase())
  );

  
  const hasUnassignedTickets = tickets.some(ticket => !ticket.assigneeId);

  useEffect(() => {
    if (id) {
      loadProjectData(id);
    }
  }, [id]);

  const loadProjectData = async (projectId: string) => {
    try {
      setIsLoading(true);
      const [projectData, ticketsData, membersData] = await Promise.all([
        projectService.getProject(projectId),
        ticketService.getProjectTickets(projectId),
        memberService.getProjectMembers(projectId),
      ]);
      setProject(projectData);
      setTickets(ticketsData);
      setMembers(membersData);
          } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load project tickets';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
  };

  
  const filteredTickets = tickets.filter(ticket => {

    if (filter !== 'all' && ticket.status !== filter) return false;
    
   
    if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    

    if (selectedLabels.length > 0 && !selectedLabels.some(label => 
        ticket.labels && ticket.labels.includes(label))) return false;
    
    
    if (selectedPriorities.length > 0 && !selectedPriorities.includes(ticket.priority)) return false;
    
   
    if (selectedAssignees.length > 0) {
      
      if (selectedAssignees.includes('unassigned')) {
       
        if (ticket.assigneeId) {
          return false;
        }
      } else {
        
        if (ticket.assigneeId) {
          const member = members.find(m => m.userId === ticket.assigneeId);
          const memberName = member ? (member.name || member.email) : null;
          if (!memberName || !selectedAssignees.includes(memberName)) {
            return false;
          }
        } else {
         
          return false;
        }
      }
    }
    
    return true;
  });

  const handleTicketUpdate = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket._id === ticketId ? { ...ticket, ...updates } : ticket
      )
    );
  };

  const toggleLabel = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const toggleAssignee = (assigneeId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(assigneeId) 
        ? prev.filter(a => a !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setLabelSearchTerm('');
    setSelectedLabels([]);
    setSelectedPriorities([]);
    setSelectedAssignees([]);
    setFilter('all');
  };

  const hasActiveFilters = searchTerm || labelSearchTerm || selectedLabels.length > 0 || selectedPriorities.length > 0 || selectedAssignees.length > 0 || filter !== 'all';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to={`/projects/${id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Project
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <Link
            to="/projects"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Project Tickets</h1>
            <p className="text-gray-600">{project.name}</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Link
              to={`/projects/${id}`}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium text-center"
            >
              Back to Project
            </Link>
            <Link
              to={`/projects/${id}/tickets/create`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-center"
            >
              Create Ticket
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {(['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tickets by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {selectedLabels.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Selected Labels:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {label}
                    <button
                      onClick={() => toggleLabel(label)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedAssignees.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-green-800 mb-2">Selected Assignees:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedAssignees.map((assigneeId) => (
                  <span
                    key={assigneeId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {assigneeId === 'unassigned' ? 'Unassigned' : assigneeId}
                    <button
                      onClick={() => toggleAssignee(assigneeId)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Active
                </span>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Labels</h4>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Type label name and press Enter to add..."
                    value={labelSearchTerm}
                    onChange={(e) => setLabelSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && labelSearchTerm.trim()) {
                        const newLabel = labelSearchTerm.trim();
                        if (!selectedLabels.includes(newLabel)) {
                          setSelectedLabels(prev => [...prev, newLabel]);
                        }
                        setLabelSearchTerm('');
                      }
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                {labelSearchTerm && filteredLabels.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Available labels:</p>
                    <div className="flex flex-wrap gap-1">
                      {filteredLabels
                        .filter(label => !selectedLabels.includes(label))
                        .map((label) => (
                          <button
                            key={label}
                            onClick={() => {
                              setSelectedLabels(prev => [...prev, label]);
                              setLabelSearchTerm('');
                            }}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            + {label}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
                
                <p className="mt-2 text-xs text-gray-500">
                  Type a label name and press Enter to add it, or click on available labels below.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {allPriorities.map((priority) => (
                    <button
                      key={priority}
                      onClick={() => togglePriority(priority)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                        selectedPriorities.includes(priority)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Assignee</h4>
                
                {hasUnassignedTickets && (
                  <div className="mb-3">
                    <button
                      onClick={() => {
                        if (selectedAssignees.includes('unassigned')) {
                          setSelectedAssignees(prev => prev.filter(a => a !== 'unassigned'));
                        } else {
                          setSelectedAssignees(prev => [...prev, 'unassigned']);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        selectedAssignees.includes('unassigned')
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Unassigned
                    </button>
                  </div>
                )}
                
                <select
                  value=""
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue && !selectedAssignees.includes(selectedValue)) {
                      setSelectedAssignees(prev => [...prev, selectedValue]);
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select assignee to add...</option>
                  {members.map((member) => {
                    const memberName = member.name || member.email; 
                    return (
                      <option 
                        key={member._id || member.userId} 
                        value={memberName}
                        disabled={selectedAssignees.includes(memberName)}
                      >
                        {memberName} {selectedAssignees.includes(memberName) ? '(Already selected)' : ''}
                      </option>
                    );
                  })}
                </select>
                
                <p className="mt-2 text-xs text-gray-500">
                  Select assignees from the dropdown above. Selected assignees will be shown above.
                </p>
              </div>

              {hasActiveFilters && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {filteredTickets.length} of {tickets.length} tickets
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {filter === 'all' ? (
          <>
            {hasActiveFilters && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Search Results:</span> {filteredTickets.length} tickets found
                    {searchTerm && (
                      <span className="ml-2">
                        for "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 sm:mt-0 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your search criteria or filters."
                    : "Get started by creating your first ticket."
                  }
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearAllFilters}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Clear all filters
                  </button>
                ) : (
                  <Link
                    to={`/projects/${id}/tickets/create`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Create Your First Ticket
                  </Link>
                )}
              </div>
            ) : (
              <KanbanBoard
                tickets={filteredTickets}
                onTicketUpdate={handleTicketUpdate}
                projects={[]}
                showProjectName={false}
              />
            )}
          </>
        ) : (
          <>
            {hasActiveFilters && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Filtered Results:</span> {filteredTickets.length} tickets found
                    {searchTerm && (
                      <span className="ml-2">
                        for "<span className="font-medium">{searchTerm}</span>"
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 sm:mt-0 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                  <p className="text-gray-500 mb-4">
                    {hasActiveFilters 
                      ? "Try adjusting your search criteria or filters."
                      : "Get started by creating your first ticket."
                    }
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={clearAllFilters}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Clear all filters
                    </button>
                  ) : (
                    <Link
                      to={`/projects/${id}/tickets/create`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      Create Your First Ticket
                    </Link>
                  )}
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div key={ticket._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col space-y-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{ticket.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          {ticket.assigneeId && (
                            <span>
                              Assignee: {
                                (() => {
                                  const member = members.find(m => m.userId === ticket.assigneeId);
                                  return member ? (member.name || member.email) : ticket.assigneeId;
                                })()
                              }
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      
                      {ticket.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ticket.labels.map((label, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
