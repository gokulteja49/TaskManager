import React, { useState, useEffect } from 'react';

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  isFading?: boolean;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState({
    title: false,
    description: false,
    dueDate: false,
  });

  // Fetch tasks from the server-side API route
  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!title || !description || !dueDate) {
      setError({
        title: !title,
        description: !description,
        dueDate: !dueDate,
      });
      return;
    }

    // Send task to the API route for insertion
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description, dueDate }),
    });

    if (response.ok) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setError({
        title: false,
        description: false,
        dueDate: false,
      });

      // Fetch updated tasks
      const fetchedTasks = await fetch('/api/tasks');
      const tasksData = await fetchedTasks.json();
      setTasks(tasksData);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !completed }),
    });

    const fetchedTasks = await fetch('/api/tasks');
    const tasksData = await fetchedTasks.json();
    setTasks(tasksData);
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    const fetchedTasks = await fetch('/api/tasks');
    const tasksData = await fetchedTasks.json();
    setTasks(tasksData);
  };

  return (
    <div className="flex min-h-screen">
      {/* Task input section */}
      <div className="w-1/2 p-8 bg-gray-800 text-white flex flex-col justify-center">
        <h1 className="text-5xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
          TASK-MANAGER
        </h1>
        <input
          type="text"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${error.title ? 'border-red-500 placeholder-red-500' : ''} mb-4`}
        />
        <input
          type="text"
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${error.description ? 'border-red-500 placeholder-red-500' : ''} mb-4`}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={`p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${error.dueDate ? 'border-red-500 placeholder-red-500' : ''} mb-4`}
        />
        <button
          onClick={handleAddTask}
          disabled={!title || !description || !dueDate}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-indigo-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
        >
          Add Task
        </button>
      </div>

      {/* Task display section */}
      <div className="w-1/2 p-8 bg-gray-700 text-white overflow-y-auto">
        <h1 className="text-4xl font-semibold text-center mb-6">Task Dashboard</h1>
        <ul>
          {tasks.map((task) => (
            <li
              key={task._id}
              className={`p-4 bg-gray-600 rounded-lg shadow-lg flex justify-between items-center transition-all duration-300 transform ${task.completed ? 'bg-green-700' : 'bg-gray-600'} hover:scale-105 ${task.isFading ? 'opacity-0 transition-opacity duration-1000' : ''}`}
            >
              <div>
                <h3 className="text-xl font-semibold">{task.title}</h3>
                <p className="text-sm">{task.description}</p>
                <p className="text-xs text-gray-300">{task.dueDate}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleToggleTask(task._id, task.completed)}
                  className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg shadow-md hover:from-green-500 hover:to-green-400 transition-all duration-300 transform hover:scale-105"
                >
                  {task.completed ? 'Undo' : 'Complete'}
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg shadow-md hover:from-red-500 hover:to-red-400 transition-all duration-300 transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskManager;
