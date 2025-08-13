/**
 * Analytics Component - Data visualization and insights
 * 
 * This component provides comprehensive analytics and data visualization
 * for projects and tasks using Chart.js for interactive charts.
 * 
 * Features:
 * - Project status distribution charts
 * - Task analytics and progress tracking
 * - Monthly project trends
 * - Interactive Chart.js visualizations
 * - Responsive chart layouts
 */

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users,
  FolderOpen,
  CheckSquare,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { analyticsApi } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Statistics card component for analytics
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} props.value - Main value to display
 * @param {string} props.subtitle - Subtitle text
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.color - Color theme
 * @returns {JSX.Element} Analytics stats card
 */
function AnalyticsStatsCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Chart wrapper component with loading state
 * @param {Object} props - Component props
 * @param {string} props.title - Chart title
 * @param {React.ReactNode} props.children - Chart component
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} Chart wrapper
 */
function ChartWrapper({ title, children, loading }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner h-8 w-8"></div>
          </div>
        ) : (
          <div className="chart-container">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main Analytics component
 * @returns {JSX.Element} Analytics page
 */
function Analytics() {
  const [loading, setLoading] = useState(true);
  const [projectAnalytics, setProjectAnalytics] = useState(null);
  const [taskAnalytics, setTaskAnalytics] = useState(null);

  /**
   * Fetch analytics data from API
   */
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [projectRes, taskRes] = await Promise.all([
        analyticsApi.getProjects(),
        analyticsApi.getTasks()
      ]);

      setProjectAnalytics(projectRes.data);
      setTaskAnalytics(taskRes.data);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Prepare chart data
  const projectStatusChartData = projectAnalytics ? {
    labels: Object.keys(projectAnalytics.projects_by_status).map(status => 
      status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Projects',
        data: Object.values(projectAnalytics.projects_by_status),
        backgroundColor: [
          '#3B82F6', // blue
          '#10B981', // emerald
          '#F59E0B', // amber
          '#EF4444', // red
          '#8B5CF6'  // violet
        ],
        borderWidth: 0,
      },
    ],
  } : null;

  const taskStatusChartData = taskAnalytics ? {
    labels: Object.keys(taskAnalytics.tasks_by_status).map(status => 
      status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Tasks',
        data: Object.values(taskAnalytics.tasks_by_status),
        backgroundColor: [
          '#6B7280', // gray
          '#3B82F6', // blue  
          '#F59E0B', // amber
          '#10B981'  // emerald
        ],
        borderColor: [
          '#6B7280',
          '#3B82F6',
          '#F59E0B',
          '#10B981'
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const taskPriorityChartData = taskAnalytics ? {
    labels: Object.keys(taskAnalytics.tasks_by_priority).map(priority => 
      priority.charAt(0).toUpperCase() + priority.slice(1)
    ),
    datasets: [
      {
        label: 'Tasks by Priority',
        data: Object.values(taskAnalytics.tasks_by_priority),
        backgroundColor: [
          '#6B7280', // gray - low
          '#3B82F6', // blue - medium
          '#F59E0B', // amber - high
          '#EF4444'  // red - critical
        ],
        borderWidth: 0,
      },
    ],
  } : null;

  const projectTrendChartData = projectAnalytics ? {
    labels: Object.keys(projectAnalytics.projects_by_month),
    datasets: [
      {
        label: 'Projects Created',
        data: Object.values(projectAnalytics.projects_by_month),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  } : null;

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '60%',
  };

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your project and task performance with detailed analytics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStatsCard
          title="Total Projects"
          value={projectAnalytics?.total_projects?.toString() || '0'}
          subtitle="All projects in system"
          icon={FolderOpen}
          color="blue"
        />
        <AnalyticsStatsCard
          title="Total Tasks"
          value={taskAnalytics?.total_tasks?.toString() || '0'}
          subtitle="All tasks created"
          icon={CheckSquare}
          color="green"
        />
        <AnalyticsStatsCard
          title="Completed Tasks"
          value={taskAnalytics?.tasks_by_status?.done?.toString() || '0'}
          subtitle="Tasks marked as done"
          icon={TrendingUp}
          color="purple"
        />
        <AnalyticsStatsCard
          title="Overdue Tasks"
          value={taskAnalytics?.overdue_tasks?.toString() || '0'}
          subtitle="Tasks past due date"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <ChartWrapper title="Project Status Distribution" loading={!projectStatusChartData}>
          {projectStatusChartData && (
            <Doughnut data={projectStatusChartData} options={doughnutOptions} />
          )}
        </ChartWrapper>

        {/* Task Status Distribution */}
        <ChartWrapper title="Task Status Distribution" loading={!taskStatusChartData}>
          {taskStatusChartData && (
            <Bar data={taskStatusChartData} options={chartOptions} />
          )}
        </ChartWrapper>

        {/* Task Priority Distribution */}
        <ChartWrapper title="Task Priority Distribution" loading={!taskPriorityChartData}>
          {taskPriorityChartData && (
            <Doughnut data={taskPriorityChartData} options={doughnutOptions} />
          )}
        </ChartWrapper>

        {/* Project Creation Trends */}
        <ChartWrapper title="Project Creation Trends" loading={!projectTrendChartData}>
          {projectTrendChartData && (
            <Line data={projectTrendChartData} options={chartOptions} />
          )}
        </ChartWrapper>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Analytics Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Project Breakdown
            </CardTitle>
            <CardDescription>
              Detailed breakdown of projects by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectAnalytics ? (
              <div className="space-y-3">
                {Object.entries(projectAnalytics.projects_by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`status-badge ${status}`}>
                        {status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="font-medium">{count} projects</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No project data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Analytics Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Task Breakdown
            </CardTitle>
            <CardDescription>
              Detailed breakdown of tasks by status and priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            {taskAnalytics ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">By Status</h4>
                  <div className="space-y-2">
                    {Object.entries(taskAnalytics.tasks_by_status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-sm">
                        <Badge className={`status-badge ${status}`}>
                          {status.replace('_', ' ')}
                        </Badge>
                        <span>{count} tasks</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">By Priority</h4>
                  <div className="space-y-2">
                    {Object.entries(taskAnalytics.tasks_by_priority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between text-sm">
                        <Badge className={`priority-badge ${priority}`}>
                          {priority}
                        </Badge>
                        <span>{count} tasks</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No task data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;