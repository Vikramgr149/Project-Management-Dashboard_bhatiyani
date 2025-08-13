/**
 * Dashboard Component - Main dashboard with overview and quick stats
 * 
 * This component displays the main dashboard with key metrics,
 * recent projects, tasks, and quick action buttons.
 * Serves as the landing page for the application.
 * 
 * Features:
 * - Overview statistics cards
 * - Recent projects and tasks
 * - Quick action buttons
 * - Responsive design
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { api } from '../services/api';

/**
 * Statistics card component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.value - Main value to display
 * @param {string} props.description - Card description
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.trend - Trend indicator (optional)
 * @returns {JSX.Element} Statistics card
 */
function StatsCard({ title, value, description, icon: Icon, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {description}
          {trend && (
            <Badge variant="secondary" className="ml-2">
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Recent projects list component
 * @param {Object} props - Component props
 * @param {Array} props.projects - Array of recent projects
 * @returns {JSX.Element} Recent projects list
 */
function RecentProjects({ projects }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No projects yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.slice(0, 5).map((project) => (
        <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{project.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {project.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`status-badge ${project.status}`}>
              {project.status.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(project.progress)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Recent tasks list component
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of recent tasks
 * @returns {JSX.Element} Recent tasks list
 */
function RecentTasks({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No tasks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.slice(0, 5).map((task) => (
        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {task.description.substring(0, 50)}...
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`priority-badge ${task.priority}`}>
              {task.priority}
            </Badge>
            <Badge className={`status-badge ${task.status}`}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main Dashboard component
 * @returns {JSX.Element} Dashboard page
 */
function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  /**
   * Fetch dashboard data from API
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [projectsRes, tasksRes, projectAnalyticsRes, taskAnalyticsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/analytics/projects'),
        api.get('/analytics/tasks')
      ]);

      // Set stats
      setStats({
        projects: projectAnalyticsRes.data.total_projects || 0,
        tasks: taskAnalyticsRes.data.total_tasks || 0,
        completedTasks: taskAnalyticsRes.data.tasks_by_status?.done || 0,
        overdueTasks: taskAnalyticsRes.data.overdue_tasks || 0
      });

      // Set recent data
      setRecentProjects(projectsRes.data.slice(0, 5) || []);
      setRecentTasks(tasksRes.data.slice(0, 5) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button asChild size="sm">
            <Link to="/projects">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Projects"
          value={stats.projects.toString()}
          description="Active projects"
          icon={FolderOpen}
        />
        <StatsCard
          title="Total Tasks"
          value={stats.tasks.toString()}
          description="All tasks"
          icon={CheckSquare}
        />
        <StatsCard
          title="Completed Tasks"
          value={stats.completedTasks.toString()}
          description="Tasks done"
          icon={TrendingUp}
          trend="+12%"
        />
        <StatsCard
          title="Overdue Tasks"
          value={stats.overdueTasks.toString()}
          description="Need attention"
          icon={AlertTriangle}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Recent Projects
            </CardTitle>
            <CardDescription>
              Your most recently updated projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentProjects projects={recentProjects} />
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/projects">View All Projects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
            <CardDescription>
              Your most recently updated tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTasks tasks={recentTasks} />
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/tasks">View All Tasks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;