import api from '../utils/api';
import type { User } from '../types/auth';

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface UserFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const userService = {
  async getUsers(filters: UserFilters = {}): Promise<UserResponse> {
    try {
      const response = await api.get<UserResponse>('/users', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw new Error('Failed to fetch users.');
    }
  },

  async getUser(id: string): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw new Error('Failed to fetch user.');
    }
  },

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await api.put<User>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error('Failed to update user.');
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Delete user error:', error);
      throw new Error('Failed to delete user.');
    }
  },


};
