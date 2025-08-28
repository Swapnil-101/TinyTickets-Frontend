import api from '../utils/api';

export interface Member {
  _id?: string;
  userId: string;
  email: string;
  role: 'MEMBER' | 'OWNER';
  projectId: string;
  name?: string;
  addedAt: string;
}

export interface AddMemberData {
  email: string;
  role: 'MEMBER' | 'OWNER';
}

export interface UpdateMemberData {
  role: 'MEMBER' | 'OWNER';
}

export const memberService = {
  async getProjectMembers(projectId: string): Promise<Member[]> {
    try {
      const response = await api.get<Member[]>(`/projects/${projectId}/members`);
      return response.data;
    } catch (error) {
      console.error('Get project members error:', error);
      throw new Error('Failed to fetch project members.');
    }
  },

  async addMember(projectId: string, data: AddMemberData): Promise<Member> {
    try {
      const response = await api.post<Member>(`/projects/${projectId}/members`, data);
      return response.data;
    } catch (error) {
      console.error('Add member error:', error);
      throw new Error('Failed to add member to project.');
    }
  },

  async updateMemberRole(projectId: string, memberId: string, data: UpdateMemberData): Promise<Member> {
    try {
      const response = await api.put<Member>(`/projects/${projectId}/members/${memberId}`, data);
      return response.data;
    } catch (error) {
      console.error('Update member role error:', error);
      throw new Error('Failed to update member role.');
    }
  },

  async removeMember(projectId: string, memberId: string): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
    } catch (error) {
      console.error('Remove member error:', error);
      throw new Error('Failed to remove member from project.');
    }
  },

  async getMember(projectId: string, memberId: string): Promise<Member> {
    try {
      const response = await api.get<Member>(`/projects/${projectId}/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Get member error:', error);
      throw new Error('Failed to fetch member.');
    }
  },
};
