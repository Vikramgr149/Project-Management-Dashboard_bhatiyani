/**
 * Tasks Component - Task management interface
 * 
 * This component provides a comprehensive interface for managing tasks
 * including creating, editing, viewing, and organizing tasks by project.
 * 
 * Features:
 * - Task listing with search and filters
 * - Create/edit task forms
 * - Task status and priority management
 * - Project-based task organization
 * - Due date tracking
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Search,
  Filter,
  CheckSquare,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { tasksApi, projectsApi, usersApi } from '../services/api';

/**
 * Task card component for displaying individual tasks
 * @param {Object} props - Component props
 * @param {Object} props.task - Task data
 * @param {Array} props.projects - Available projects
 * @param {Array} props.users - Available users
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 * @returns {JSX.Element} Task card
 */
function TaskCard({ task, projects, users, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now && task.status !== 'done';
    const isToday = date.toDateString() === now.toDateString();
    
    return {
      formatted: date.toLocaleDateString(),
      isOverdue,
      isToday
    };
  };

  const getProject = (projectId) => {
    return projects.find(p => p.id === projectId);
  };

  const getUser = (userId) => {
    return users.find(u => u.id === userId);
  };

  const dueDateInfo = formatDate(task.due_date);
  const project = getProject(task.project_id);
  const assignee = getUser(task.assignee_id);

  return (
    <Card className="task-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            {task.description && (
              <CardDescription className="mt-2">
                {task.description}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Badge className={`priority-badge ${task.priority}`}>
              {task.priority}
            </Badge>
            <Badge className={`status-badge ${task.status}`}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Task Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Project:</span>
              <span>{project?.name || 'Unknown'}</span>
            </div>
            
            {assignee && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Assignee:</span>
                <span>{assignee.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className={
                dueDateInfo.isOverdue ? 'text-red-600 font-medium' :
                dueDateInfo.isToday ? 'text-yellow-600 font-medium' : ''
              }>
                {dueDateInfo.formatted}
                {dueDateInfo.isOverdue && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                {dueDateInfo.isToday && <Clock className="inline h-3 w-3 ml-1" />}
              </span>
            </div>

            {(task.estimated_hours || task.actual_hours) && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Hours:</span>
                <span>
                  {task.actual_hours || 0}
                  {task.estimated_hours && ` / ${task.estimated_hours}`}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(task.id)}>
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
 * Task form component for creating/editing tasks
 * @param {Object} props - Component props
 * @param {Object} props.task - Task data (null for create)
 * @param {Array} props.projects - Available projects
 * @param {Array} props.users - Available users
 * @param {Function} props.onSubmit - Submit callback
 * @param {Function} props.onCancel - Cancel callback
 * @returns {JSX.Element} Task form
 */
function TaskForm({ task, projects, users, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    project_id: task?.project_id || '',
    assignee_id: task?.assignee_id || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    estimated_hours: task?.estimated_hours || '',
    actual_hours: task?.actual_hours || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format data for API
    const submitData = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
      assignee_id: formData.assignee_id || null
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
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
            <Label htmlFor="project_id">Project *</Label>
            <Select value={formData.project_id} onValueChange={(value) => setFormData({...formData, project_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assignee_id">Assignee</Label>
            <Select value={formData.assignee_id} onValueChange={(value) => setFormData({...formData, assignee_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
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
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estimated_hours">Estimated Hours</Label>
            <Input
              id="estimated_hours"
              type="number"
              step="0.5"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({...formData, estimated_hours: e.target.value})}
              placeholder="e.g., 8"
            />
          </div>

          <div>
            <Label htmlFor="actual_hours">Actual Hours</Label>
            <Input
              id="actual_hours"
              type="number"
              step="0.5"
              value={formData.actual_hours}
              onChange={(e) => setFormData({...formData, actual_hours: e.target.value})}
              placeholder="e.g., 6.5"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Main Tasks component
 * @returns {JSX.Element} Tasks page
 */
function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  /**
   * Fetch tasks, projects, and users data
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        tasksApi.getAll(),
        projectsApi.getAll(),
        usersApi.getAll()
      ]);
      
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle creating a new task
   * @param {Object} taskData - Task data to create
   */
  const handleCreateTask = async (taskData) => {
    try {
      const response = await tasksApi.create(taskData);
      setTasks([...tasks, response.data]);
      setShowForm(false);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  /**
   * Handle updating an existing task
   * @param {Object} taskData - Updated task data
   */
  const handleUpdateTask = async (taskData) => {
    try {
      const response = await tasksApi.update(editingTask.id, taskData);
      setTasks(tasks.map(t => t.id === editingTask.id ? response.data : t));
      setShowForm(false);
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  /**
   * Handle deleting a task
   * @param {string} taskId - ID of task to delete
   */
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksApi.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
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
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your project tasks
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {tasks.length === 0 ? (
              <>
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No tasks yet</p>
                <p className="text-sm">Create your first task to get started</p>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No tasks match your search</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projects={projects}
              users={users}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Task Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <DialogDescription>
              {editingTask 
                ? 'Update task information and settings'
                : 'Create a new task and assign it to a project'
              }
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            projects={projects}
            users={users}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Tasks;