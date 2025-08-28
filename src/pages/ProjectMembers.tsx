import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { memberService, type Member, type AddMemberData } from '../services/memberService';
import { projectService, type Project } from '../services/projectService';
import { toast } from 'react-toastify';

export const ProjectMembers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState<AddMemberData>({
    email: '',
    role: 'MEMBER',
  });

  useEffect(() => {
    if (id) {
     
      loadProjectAndMembers(id);
    }
  }, [id]);



  const loadProjectAndMembers = async (projectId: string) => {
    try {
      setIsLoading(true);
      const [projectData, membersData] = await Promise.all([
        projectService.getProject(projectId),
        memberService.getProjectMembers(projectId),
      ]);
      setProject(projectData);
      setMembers(membersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project members';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;

    try {
     
      const addedMember = await memberService.addMember(id, newMember);
     
      
      
      const validatedMember = {
        ...addedMember,
        email: addedMember.email || newMember.email,
        name: addedMember.name || newMember.email.split('@')[0], 
        userId: addedMember.userId || addedMember._id || 'temp-' + Date.now(),
        role: addedMember.role || newMember.role,
        projectId: addedMember.projectId || id,
        addedAt: addedMember.addedAt || new Date().toISOString()
      };
      
      setMembers([...members, validatedMember]);
      setNewMember({ email: '', role: 'MEMBER' });
      setShowAddForm(false);
      toast.success(`Member ${newMember.email} added successfully!`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;
    if (!memberId) {
      setError('Cannot remove member: Member ID is missing');
      return;
    }
    
   

    try {
      await memberService.removeMember(id, memberId);
      setMembers(members.filter(member => member.userId !== memberId));
      toast.success('Member removed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'MEMBER':
        return 'bg-blue-100 text-blue-800';
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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Members</h1>
            <p className="text-gray-600">{project.name}</p>
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/projects/${id}`}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Back to Project
            </Link>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Add Member
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as 'MEMBER' | 'OWNER' })}
                >
                  <option value="MEMBER">Member</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"

                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No members added yet.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add Your First Member
              </button>
            </div>
          ) : (
            members.map((member) => {
              
              if (!member || !member.userId) {
                console.warn('Invalid member object:', member);
                return null;
              }
              
              return (
                <div key={member.userId} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {member.name && member.name.length > 0 
                        ? member.name.charAt(0).toUpperCase() 
                        : (member.email && member.email.length > 0 
                            ? member.email.charAt(0).toUpperCase() 
                            : '?')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.name || member.email || 'Unknown Member'}
                    </p>
                    <p className="text-sm text-gray-500">{member.email || 'No email'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                  <button
                    onClick={() => {
                      if (member.userId) {
                        handleRemoveMember(member.userId);
                      } else {
                        console.error('Member ID is undefined:', member);
                        setError('Cannot remove member: ID is missing');
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
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
