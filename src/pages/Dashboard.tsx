import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { toast } from 'react-toastify';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    if (user?.name) {
      const hasShownWelcome = localStorage.getItem('dashboardWelcomeShown');
      if (!hasShownWelcome) {
        toast.info(`Welcome back, ${user.name}! 👋`);
        localStorage.setItem('dashboardWelcomeShown', 'true');
      }
    }
  }, [user?.name]);

  const loadDashboardData = async () => {
    try {
      const [ projects] = await Promise.all([
        projectService.getProjects({ limit: 3 }),
      ]);
      setRecentProjects(projects);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your tickets and recent activity.
        </p>
      </div>

      

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
            <Link
              to="/projects"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No projects yet</p>
              <Link
                to="/projects/create"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{project.name}</span>
                      <p className="text-xs text-gray-500">{project.description}</p>
                    </div>
                  </div>
                  <Link
                    to={`/projects/${project._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
