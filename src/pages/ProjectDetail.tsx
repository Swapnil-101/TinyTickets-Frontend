import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService, type Project } from '../services/projectService';
import { memberService } from '../services/memberService';
import { toast } from 'react-toastify';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const [projectData, members] = await Promise.all([
        projectService.getProject(projectId),
        memberService.getProjectMembers(projectId),
      ]);
      setProject(projectData);
      setMemberCount(members.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
            to="/projects"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Projects
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
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Link
              to="/projects"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium text-center"
            >
              Back to Projects
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Project ID:</span>
                <span className="font-mono text-gray-900 break-all">{project._id}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString()} at{' '}
                  {new Date(project.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                  Active
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-gray-600">Members:</span>
                <span className="text-gray-900">{memberCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to={`/projects/${project._id}/tickets`}
                className="block w-full text-left px-3 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
              >
                View Tickets →
              </Link>
              <Link
                to={`/projects/${project._id}/members`}
                className="block w-full text-left px-3 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
              >
                Manage Members ({memberCount}) →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-gray-500">No recent activity to display.</p>
      </div>
    </div>
  );
};
