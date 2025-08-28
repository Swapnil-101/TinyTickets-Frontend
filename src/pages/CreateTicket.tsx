import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService, type CreateTicketData } from '../services/ticketService';
import { projectService, type Project } from '../services/projectService';
import { memberService, type Member } from '../services/memberService';
import { toast } from 'react-toastify';

export const CreateTicket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<CreateTicketData>({
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    assigneeId: '',
    labels: [],
  });
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    if (id) {
      loadProjectData(id);
    }
  }, [id]);

  const loadProjectData = async (projectId: string) => {
    try {
      setIsLoading(true);
      const [projectData, membersData] = await Promise.all([
        projectService.getProject(projectId),
        memberService.getProjectMembers(projectId),
      ]);
      setProject(projectData);
      setMembers(membersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const createdTicket = await ticketService.createTicket(id, ticket);
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${createdTicket._id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const addLabel = () => {
    if (newLabel.trim() && !ticket.labels.includes(newLabel.trim())) {
      setTicket({
        ...ticket,
        labels: [...ticket.labels, newLabel.trim()],
      });
      setNewLabel('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setTicket({
      ...ticket,
      labels: ticket.labels.filter(label => label !== labelToRemove),
    });
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
          <button
            onClick={() => navigate(`/projects/${id}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Create New Ticket
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Project: {project.name}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter ticket title"
                value={ticket.title}
                onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe the issue or feature request"
                value={ticket.description}
                onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={ticket.status}
                  onChange={(e) => setTicket({ ...ticket, status: e.target.value as any })}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={ticket.priority}
                  onChange={(e) => setTicket({ ...ticket, priority: e.target.value as any })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
                Assignee
              </label>
              <select
                id="assignee"
                name="assignee"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={ticket.assigneeId}
                onChange={(e) => setTicket({ ...ticket, assigneeId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member.userId || member._id}>
                    {member.name || member.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="labels" className="block text-sm font-medium text-gray-700">
                Labels
              </label>
              <div className="mt-1 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  placeholder="Add a label"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                />
                <button
                  type="button"
                  onClick={addLabel}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm w-full sm:w-auto"
                >
                  Add
                </button>
              </div>
              {ticket.labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {ticket.labels.map((label, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}/tickets`)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
