/**
 * WorkflowView Component - React Flow visualization for project workflows
 * 
 * This component provides an interactive workflow visualization using React Flow
 * to display project tasks and their relationships in a visual flowchart format.
 * 
 * Features:
 * - Interactive React Flow diagram
 * - Task nodes with status and priority indicators
 * - Connection lines showing task dependencies
 * - Drag and drop functionality
 * - Zoom and pan controls
 * - Responsive layout
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { projectsApi, tasksApi } from '../services/api';

/**
 * Custom task node component for React Flow
 * @param {Object} props - Node props from React Flow
 * @returns {JSX.Element} Custom task node
 */
function TaskNode({ data }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <Square className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'review':
        return <Clock className="h-4 w-4" />;
      case 'done':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'border-gray-300 bg-gray-50';
      case 'in_progress':
        return 'border-blue-300 bg-blue-50';
      case 'review':
        return 'border-yellow-300 bg-yellow-50';
      case 'done':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'text-gray-600';
      case 'medium':
        return 'text-blue-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now && data.status !== 'done';
    
    return {
      formatted: date.toLocaleDateString(),
      isOverdue
    };
  };

  const dueDateInfo = formatDate(data.due_date);

  return (
    <div className={`px-4 py-3 shadow-md rounded-lg border-2 min-w-[200px] max-w-[250px] ${getStatusColor(data.status)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(data.status)}
          <span className="font-medium text-sm">{data.title}</span>
        </div>
        <Badge className={`priority-badge ${data.priority} text-xs`}>
          {data.priority}
        </Badge>
      </div>
      
      {data.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {data.description}
        </p>
      )}
      
      <div className="space-y-1">
        {data.assignee && (
          <div className="flex items-center gap-1 text-xs">
            <User className="h-3 w-3" />
            <span>{data.assignee}</span>
          </div>
        )}
        
        {dueDateInfo && (
          <div className={`flex items-center gap-1 text-xs ${dueDateInfo.isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
            <Calendar className="h-3 w-3" />
            <span>{dueDateInfo.formatted}</span>
            {dueDateInfo.isOverdue && <AlertTriangle className="h-3 w-3" />}
          </div>
        )}
        
        <Badge className={`status-badge ${data.status} text-xs`}>
          {data.status.replace('_', ' ')}
        </Badge>
      </div>
    </div>
  );
}

// Custom node types
const nodeTypes = {
  taskNode: TaskNode,
};

/**
 * Main WorkflowView component
 * @returns {JSX.Element} Workflow visualization page
 */
function WorkflowView() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  /**
   * Handle new connections between nodes
   */
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  /**
   * Fetch project and tasks data
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [projectRes, tasksRes] = await Promise.all([
        projectsApi.getById(projectId),
        tasksApi.getAll(projectId)
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data || []);
      
      // Transform tasks into React Flow nodes
      const taskNodes = (tasksRes.data || []).map((task, index) => {
        // Create a simple grid layout
        const col = index % 4;
        const row = Math.floor(index / 4);
        
        return {
          id: task.id,
          type: 'taskNode',
          position: { 
            x: col * 280 + 50, 
            y: row * 150 + 50 
          },
          data: {
            ...task,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee_name || 'Unassigned',
            due_date: task.due_date
          },
        };
      });

      setNodes(taskNodes);

      // Create some example edges based on task dependencies
      // In a real application, you would have actual dependency data
      const taskEdges = [];
      for (let i = 0; i < taskNodes.length - 1; i++) {
        // Create sequential connections for demonstration
        if (i % 3 === 0 && i + 1 < taskNodes.length) {
          taskEdges.push({
            id: `e${i}-${i + 1}`,
            source: taskNodes[i].id,
            target: taskNodes[i + 1].id,
            type: 'smoothstep',
            animated: taskNodes[i].data.status === 'in_progress',
          });
        }
      }

      setEdges(taskEdges);
      
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      toast.error('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Project not found</p>
          <p className="text-sm">The requested project could not be loaded</p>
          <Button asChild className="mt-4">
            <Link to="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-muted-foreground mt-1">Project Workflow Visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`status-badge ${project.status}`}>
            {project.status.replace('_', ' ')}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {Math.round(project.progress)}% Complete
          </span>
        </div>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Tasks:</span>
              <span className="ml-2">{tasks.length}</span>
            </div>
            <div>
              <span className="font-medium">Completed:</span>
              <span className="ml-2">
                {tasks.filter(t => t.status === 'done').length} / {tasks.length}
              </span>
            </div>
            <div>
              <span className="font-medium">In Progress:</span>
              <span className="ml-2">
                {tasks.filter(t => t.status === 'in_progress').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Visualization */}
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Task Workflow
          </CardTitle>
          <CardDescription>
            Interactive visualization of project tasks and their relationships
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[500px] p-0">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Square className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No tasks in this project</p>
                <p className="text-sm">Add tasks to see the workflow visualization</p>
              </div>
            </div>
          ) : (
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-50"
              >
                <Background />
                <Controls />
                <MiniMap 
                  nodeColor={(node) => {
                    switch (node.data.status) {
                      case 'done':
                        return '#10B981';
                      case 'in_progress':
                        return '#3B82F6';
                      case 'review':
                        return '#F59E0B';
                      default:
                        return '#6B7280';
                    }
                  }}
                  className="bg-white border"
                />
                <Panel position="top-right" className="bg-white p-2 rounded border">
                  <div className="text-xs space-y-1">
                    <div className="font-medium">Legend</div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-50 border border-gray-300 rounded"></div>
                      <span>To Do</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-50 border border-yellow-300 rounded"></div>
                      <span>Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-50 border border-green-300 rounded"></div>
                      <span>Done</span>
                    </div>
                  </div>
                </Panel>
              </ReactFlow>
            </ReactFlowProvider>
          )}
        </CardContent>
      </Card>

      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['todo', 'in_progress', 'review', 'done'].map((status) => {
          const statusTasks = tasks.filter(t => t.status === status);
          const statusLabels = {
            todo: 'To Do',
            in_progress: 'In Progress', 
            review: 'Review',
            done: 'Done'
          };
          
          return (
            <Card key={status}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {statusLabels[status]}
                  <Badge className={`status-badge ${status}`}>
                    {statusTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {statusTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-muted-foreground">
                        Priority: {task.priority}
                      </div>
                    </div>
                  ))}
                  {statusTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{statusTasks.length - 3} more tasks
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default WorkflowView;