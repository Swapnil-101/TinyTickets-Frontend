import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketService, type Ticket, type Comment, type CreateCommentData, type UpdateTicketData } from '../services/ticketService';
import { projectService, type Project } from '../services/projectService';
import { memberService, type Member } from '../services/memberService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateTicketData>({});

  const getAuthorName = (authorId: string): string => {
    const member = members.find(m => m.userId === authorId) || 
                   members.find(m => m._id === authorId);
    
    if (member) {
      return member.name || member.email;
    }
    
    if (user && (user.id === authorId || user.email === authorId)) {
      return user.name || user.email;
    }
    
    return `User ${authorId.slice(-6)}`;
  };

  useEffect(() => {
    if (id) {
      loadTicketData(id);
    }
  }, [id]);

  const loadTicketData = async (ticketId: string) => {
    try {
      setIsLoading(true);
      const ticketData = await ticketService.getTicket(ticketId);
      setTicket(ticketData);
      
      const [projectData, membersData] = await Promise.all([
        projectService.getProject(ticketData.projectId),
        memberService.getProjectMembers(ticketData.projectId),
      ]);
      setProject(projectData);
      setMembers(membersData);
      
      const commentsData = await ticketService.getTicketComments(ticketId);
      setComments(commentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const commentData: CreateCommentData = { body: newComment.trim() };
      const addedComment = await ticketService.addComment(id, commentData);
      setComments([...comments, addedComment]);
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsSubmitting(true);
      const updatedTicket = await ticketService.updateTicket(id, editForm);
      setTicket(updatedTicket);
      setIsEditing(false);
      setEditForm({});
      setNewLabel('');
      toast.success('Ticket updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = () => {
    if (ticket) {
      setEditForm({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assigneeId: ticket.assigneeId,
        labels: [...ticket.labels],
      });
      setNewLabel('');
      setIsEditing(true);
    }
  };

  const [newLabel, setNewLabel] = useState('');

  const addLabel = () => {
    if (newLabel.trim() && editForm.labels && !editForm.labels.includes(newLabel.trim())) {
      setEditForm({
        ...editForm,
        labels: [...editForm.labels, newLabel.trim()],
      });
      setNewLabel('');
    } else if (newLabel.trim() && editForm.labels && editForm.labels.includes(newLabel.trim())) {
      toast.error('Label already exists');
      setNewLabel('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    if (editForm.labels) {
      setEditForm({
        ...editForm,
        labels: editForm.labels.filter(label => label !== labelToRemove),
      });
    }
  };

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

  const getAssigneeName = (assigneeId: string) => {
    const member = members.find(m => m.userId === assigneeId || m._id === assigneeId);
    return member ? member.name || member.email : 'Unassigned';
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
            to="/projects"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ticket Not Found</h2>
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
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Link
                to={`/projects/${project._id}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {project.name}
              </Link>
              <span className="text-gray-400">/</span>
              <Link
                to={`/projects/${project._id}/tickets`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Tickets
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
            <p className="text-gray-600">{ticket.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Link
              to={`/projects/${project._id}/tickets`}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium text-center"
            >
              Back to Tickets
            </Link>
            <button 
              onClick={startEditing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-center"
            >
              Edit Ticket
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ticket Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Ticket ID:</span>
                <span className="font-mono text-gray-900 break-all">{ticket._id}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)} w-fit`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Priority:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)} w-fit`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Assignee:</span>
                <span className="text-gray-900">{getAssigneeName(ticket.assigneeId || '')}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {new Date(ticket.createdAt).toLocaleDateString()} at{' '}
                  {new Date(ticket.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="text-gray-900">
                  {new Date(ticket.updatedAt).toLocaleDateString()} at{' '}
                  {new Date(ticket.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Labels</h3>
            {ticket.labels.length === 0 ? (
              <p className="text-gray-500 text-sm">No labels assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Ticket</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditTicket} className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    id="edit-priority"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editForm.priority || ''}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="edit-assignee" className="block text-sm font-medium text-gray-700">
                  Assignee
                </label>
                <select
                  id="edit-assignee"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.assigneeId || ''}
                  onChange={(e) => setEditForm({ ...editForm, assigneeId: e.target.value })}
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
                <label htmlFor="edit-labels" className="block text-sm font-medium text-gray-700">
                  Labels
                </label>
                <div className="mt-1 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    placeholder="Add a label"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={addLabel}
                    disabled={!newLabel.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    Add
                  </button>
                </div>
                {editForm.labels && editForm.labels.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editForm.labels.map((label, index) => (
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

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNewLabel('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Comments ({comments.length})</h3>
        
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="space-y-2">
            {user && (
              <div className="text-sm text-gray-600 mb-2">
                Commenting as: <span className="font-medium text-gray-900">{user.name || user.email}</span>
              </div>
            )}
            <textarea
              rows={3}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
              >
                {isSubmitting ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => {
              const authorName = getAuthorName(comment.authorId);
              const avatarInitial = authorName.charAt(0).toUpperCase();
              
              return (
                <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {avatarInitial}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {authorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.body}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
