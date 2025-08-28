import api from '../utils/api';

export interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  __v: number;
}

export interface CreateProjectData {
  name: string;
  description: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

export interface ProjectFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProjectResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const projectService = {
  async getProjects(filters: ProjectFilters = {}): Promise<Project[]> {
    try {
      const response = await api.get<Project[]>('/projects', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get projects error:', error);
      throw new Error('Failed to fetch projects.');
    }
  },

  async getProject(id: string): Promise<Project> {
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get project error:', error);
      throw new Error('Failed to fetch project.');
    }
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const response = await api.post<Project>('/projects', data);
      return response.data;
    } catch (error) {
      console.error('Create project error:', error);
      throw new Error('Failed to create project.');
    }
  },

  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    try {
      const response = await api.put<Project>(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update project error:', error);
      throw new Error('Failed to update project.');
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error('Delete project error:', error);
      throw new Error('Failed to delete project.');
    }
  },
};
