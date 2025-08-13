/**
 * Projects Component - Project management interface
 * 
 * This component provides a comprehensive interface for managing projects
 * including creating, editing, viewing, and deleting projects.
 * Also includes project insights and workflow visualization links.
 * 
 * Features:
 * - Project listing with search and filters
 * - Create/edit project forms
 * - Project progress tracking
 * - AI insights integration
 * - Workflow visualization links
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Workflow, 
  Calendar,
  Users,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { projectsApi, usersApi } from '../services/api';

/**
 * Project card component for displaying individual projects
 * @param {Object} props - Component props
 * @param {Object} props.project - Project data
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.onViewInsights - View insights callback
 * @returns {JSX.Element} Project card
 */
function ProjectCard({ project, onEdit, onDelete, onViewInsights }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="project-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription className="mt-2">
              {project.description}
            </CardDescription>
          </div>
          <Badge className={`status-badge ${project.status}`}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(project.progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Start:</span>
              <span>{formatDate(project.start_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">End:</span>
              <span>{formatDate(project.end_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Team:</span>
              <span>{project.team_members?.length || 0} members</span>
            </div>
            {project.budget && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Budget:</span>
                <span>${project.budget.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" asChild>
              <Link to={`/workflow/${project.id}`}>
                <Workflow className="h-4 w-4 mr-1" />
                Workflow
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => onViewInsights(project)}>
              <Eye className="h-4 w-4 mr-1" />
              Insights
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(project)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(project.id)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Project form component for creating/editing projects
 * @param {Object} props - Component props
 * @param {Object} props.project - Project data (null for create)
 * @param {Function} props.onSubmit - Submit callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {Array} props.users - Available users for team assignment
 * @returns {JSX.Element} Project form
 */
function ProjectForm({ project, onSubmit, onCancel, users }) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    start_date: project?.start_date ? project.start_date.split('T')[0] : '',
    end_date: project?.end_date ? project.end_date.split('T')[0] : '',
    owner_id: project?.owner_id || '',
    budget: project?.budget || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format dates for API
    const submitData = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      team_members: []
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="owner_id">Project Owner</Label>
            <Select value={formData.owner_id} onValueChange={(value) => setFormData({...formData, owner_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="budget">Budget ($)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: e.target.value})}
            placeholder="Enter budget amount"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Main Projects component
 * @returns {JSX.Element} Projects page
 */
function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [insights, setInsights] = useState(null);
  const [showInsights, setShowInsights] = useState(false);

  /**
   * Fetch projects and users data
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, usersRes] = await Promise.all([
        projectsApi.getAll(),
        usersApi.getAll()
      ]);
      
      setProjects(projectsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle creating a new project
   * @param {Object} projectData - Project data to create
   */
  const handleCreateProject = async (projectData) => {
    try {
      const response = await projectsApi.create(projectData);
      setProjects([...projects, response.data]);
      setShowForm(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  /**
   * Handle updating an existing project
   * @param {Object} projectData - Updated project data
   */
  const handleUpdateProject = async (projectData) => {
    try {
      const response = await projectsApi.update(editingProject.id, projectData);
      setProjects(projects.map(p => p.id === editingProject.id ? response.data : p));
      setShowForm(false);
      setEditingProject(null);
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  /**
   * Handle deleting a project
   * @param {string} projectId - ID of project to delete
   */
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsApi.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  /**
   * Handle viewing project insights
   * @param {Object} project - Project to get insights for
   */
  const handleViewInsights = async (project) => {
    try {
      const response = await projectsApi.getInsights(project.id);
      setInsights(response.data);
      setShowInsights(true);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load project insights');
    }
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage your projects and track their progress
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {projects.length === 0 ? (
              <>
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No projects yet</p>
                <p className="text-sm">Create your first project to get started</p>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No projects match your search</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={setEditingProject}
              onDelete={handleDeleteProject}
              onViewInsights={handleViewInsights}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Project Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <DialogDescription>
              {editingProject 
                ? 'Update project information and settings'
                : 'Create a new project to start tracking tasks and progress'
              }
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            project={editingProject}
            users={users}
            onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Project Insights Dialog */}
      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Insights</DialogTitle>
            <DialogDescription>
              AI-powered insights and recommendations for your project
            </DialogDescription>
          </DialogHeader>
          {insights && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Project Health</h4>
                <Badge variant={insights.project_health === 'Excellent' ? 'default' : 
                              insights.project_health === 'Good' ? 'secondary' : 'destructive'}>
                  {insights.project_health}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="space-y-1 text-sm">
                  {insights.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {insights.risk_factors?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Risk Factors</h4>
                  <ul className="space-y-1 text-sm">
                    {insights.risk_factors.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 text-destructive">
                        <span>⚠️</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Predicted Completion</h4>
                <p className="text-sm text-muted-foreground">
                  {insights.predicted_completion}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowInsights(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Projects;