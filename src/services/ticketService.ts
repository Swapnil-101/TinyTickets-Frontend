import api from '../utils/api';

export interface Ticket {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateTicketData {
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: string;
  labels: string[];
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: string;
  labels?: string[];
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Comment {
  _id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  __v: number;
}

export interface CreateCommentData {
  body: string;
}

export const ticketService = {
  async getProjectTickets(projectId: string, filters: TicketFilters = {}): Promise<Ticket[]> {
    try {
      const response = await api.get<Ticket[]>(`/projects/${projectId}/tickets`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get project tickets error:', error);
      throw new Error('Failed to fetch project tickets.');
    }
  },

  async getTicket(id: string): Promise<Ticket> {
    try {
      const response = await api.get<Ticket>(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get ticket error:', error);
      throw new Error('Failed to fetch ticket.');
    }
  },

  async createTicket(projectId: string, data: CreateTicketData): Promise<Ticket> {
    try {
      const response = await api.post<Ticket>(`/projects/${projectId}/tickets`, data);
      return response.data;
    } catch (error) {
      console.error('Create ticket error:', error);
      throw new Error('Failed to create ticket.');
    }
  },

  async updateTicket(id: string, data: UpdateTicketData): Promise<Ticket> {
    try {
      const response = await api.patch<Ticket>(`/tickets/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update ticket error:', error);
      throw new Error('Failed to update ticket.');
    }
  },

  async deleteTicket(id: string): Promise<void> {
    try {
      await api.delete(`/tickets/${id}`);
    } catch (error) {
      console.error('Delete ticket error:', error);
      throw new Error('Failed to delete ticket.');
    }
  },

  async getTicketComments(ticketId: string): Promise<Comment[]> {
    try {
      const response = await api.get<Comment[]>(`/tickets/${ticketId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Get ticket comments error:', error);
      throw new Error('Failed to fetch ticket comments.');
    }
  },

  async addComment(ticketId: string, data: CreateCommentData): Promise<Comment> {
    try {
      const response = await api.post<Comment>(`/tickets/${ticketId}/comments`, data);
      return response.data;
    } catch (error) {
      console.error('Add comment error:', error);
      throw new Error('Failed to add comment.');
    }
  },

  async deleteComment(ticketId: string, commentId: string): Promise<void> {
    try {
      await api.delete(`/tickets/${ticketId}/comments/${commentId}`);
    } catch (error) {
      console.error('Delete comment error:', error);
      throw new Error('Failed to delete comment.');
    }
  },

  async getTicketStats(projectId: string): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }> {
    try {
      const tickets = await this.getProjectTickets(projectId);
      const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        closed: tickets.filter(t => t.status === 'CLOSED').length,
      };
      return stats;
    } catch (error) {
      console.error('Get ticket stats error:', error);
      throw new Error('Failed to fetch ticket statistics.');
    }
  },
};
