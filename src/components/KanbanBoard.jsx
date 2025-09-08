import React, { useState } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  User, 
  Flag, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react';

const KanbanBoard = () => {
  const [columns, setColumns] = useState([
    {
      id: 'todo',
      title: 'To Do',
      color: 'bg-gray-500',
      tasks: [
        {
          id: 1,
          title: 'Review Q4 marketing campaign',
          description: 'Analyze performance metrics and prepare recommendations',
          priority: 'high',
          assignee: 'John Doe',
          dueDate: '2024-01-20',
          tags: ['marketing', 'analysis'],
          status: 'todo'
        },
        {
          id: 2,
          title: 'Update company website',
          description: 'Implement new design and content updates',
          priority: 'medium',
          assignee: 'Sarah Wilson',
          dueDate: '2024-01-25',
          tags: ['development', 'design'],
          status: 'todo'
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'bg-blue-500',
      tasks: [
        {
          id: 3,
          title: 'Database optimization',
          description: 'Improve query performance and reduce load times',
          priority: 'critical',
          assignee: 'Mike Chen',
          dueDate: '2024-01-18',
          tags: ['backend', 'performance'],
          status: 'in-progress'
        },
        {
          id: 4,
          title: 'User authentication system',
          description: 'Implement OAuth2 and JWT tokens',
          priority: 'high',
          assignee: 'Alex Rodriguez',
          dueDate: '2024-01-22',
          tags: ['security', 'backend'],
          status: 'in-progress'
        }
      ]
    },
    {
      id: 'review',
      title: 'Review',
      color: 'bg-yellow-500',
      tasks: [
        {
          id: 5,
          title: 'API documentation',
          description: 'Complete API docs for new endpoints',
          priority: 'medium',
          assignee: 'Emma Davis',
          dueDate: '2024-01-19',
          tags: ['documentation', 'api'],
          status: 'review'
        }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      color: 'bg-green-500',
      tasks: [
        {
          id: 6,
          title: 'Mobile app UI redesign',
          description: 'Complete redesign of mobile interface',
          priority: 'high',
          assignee: 'Lisa Park',
          dueDate: '2024-01-15',
          tags: ['mobile', 'ui'],
          status: 'done'
        },
        {
          id: 7,
          title: 'Email notification system',
          description: 'Set up automated email notifications',
          priority: 'medium',
          assignee: 'Tom Wilson',
          dueDate: '2024-01-12',
          tags: ['email', 'automation'],
          status: 'done'
        }
      ]
    }
  ]);

  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    tags: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return AlertCircle;
      case 'high': return Flag;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Clock;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getDateColor = (dateString) => {
    if (!dateString) return 'text-gray-500';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 1) return 'text-orange-600';
    return 'text-gray-500';
  };

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask(task);
    setDraggedFromColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    
    if (draggedTask && draggedFromColumn !== targetColumnId) {
      const newColumns = columns.map(column => {
        if (column.id === draggedFromColumn) {
          return {
            ...column,
            tasks: column.tasks.filter(task => task.id !== draggedTask.id)
          };
        }
        if (column.id === targetColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, { ...draggedTask, status: targetColumnId }]
          };
        }
        return column;
      });
      setColumns(newColumns);
    }
    
    setDraggedTask(null);
    setDraggedFromColumn(null);
  };

  const addTask = (columnId) => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        status: columnId,
        tags: newTask.tags.filter(tag => tag.trim())
      };
      
      const newColumns = columns.map(column => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: [...column.tasks, task]
          };
        }
        return column;
      });
      setColumns(newColumns);
      
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        tags: []
      });
      setShowAddTask(false);
    }
  };

  const deleteTask = (taskId, columnId) => {
    const newColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        };
      }
      return column;
    });
    setColumns(newColumns);
  };

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    })
  }));

  const TaskCard = ({ task, columnId }) => {
    const PriorityIcon = getPriorityIcon(task.priority);
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task, columnId)}
        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-move group"
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
            {task.title}
          </h4>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => deleteTask(task.id, columnId)}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            <PriorityIcon className="w-3 h-3 mr-1" />
            {task.priority}
          </span>
        </div>
        
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="space-y-2 text-xs text-gray-500">
          {task.assignee && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
          )}
          {task.dueDate && (
            <div className={`flex items-center space-x-1 ${getDateColor(task.dueDate)}`}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
            <p className="mt-2 text-gray-600">Manage your tasks and track progress</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {columns.map(column => (
            <div key={column.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <span className="text-sm font-medium text-gray-600">{column.title}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {filteredColumns.find(c => c.id === column.id)?.tasks.length || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredColumns.map(column => (
          <div
            key={column.id}
            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-200 min-h-96"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {column.tasks.length}
                </span>
              </div>
              <button
                onClick={() => setShowAddTask(column.id)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tasks */}
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {column.tasks.map(task => (
                <TaskCard key={task.id} task={task} columnId={column.id} />
              ))}
              
              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-sm">No tasks yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={() => setShowAddTask(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Task</h3>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter task title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Enter task description..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                    <input
                      type="text"
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter assignee name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newTask.tags.join(', ')}
                      onChange={(e) => setNewTask({...newTask, tags: e.target.value.split(',').map(tag => tag.trim())})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., frontend, bug, urgent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addTask(showAddTask)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
