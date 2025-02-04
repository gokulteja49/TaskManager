// actions.ts
import { db } from './db';
import { ObjectId } from 'mongodb';

// Define a type for the task to ensure type safety
interface Task {
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

// Retry Operation with Exponential Backoff
const retryOperation = async <T>(operation: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw new Error('Operation failed after multiple retries');
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error('Failed after retries');
};

// Get Tasks with Pagination
export async function getTasks(page: number = 1, limit: number = 10) {
  try {
    const tasks = await db.collection('tasks')
      .find()
      .skip((page - 1) * limit)  // Skip tasks for the current page
      .limit(limit)  // Limit the number of tasks
      .toArray();

    return tasks.map(task => ({
      ...task,
      _id: task._id.toString(),  // Convert ObjectId to string for frontend compatibility
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks');
  }
}

// Add Task
export async function addTask(title: string, description: string, dueDate: string) {
  try {
    const task: Task = { title, description, dueDate, completed: false };
    await db.collection('tasks').insertOne(task);
  } catch (error) {
    console.error('Error adding task:', error);
    throw new Error('Failed to add task');
  }
}

// Toggle Task Completion
export async function toggleTask(id: string, completed: boolean): Promise<boolean> {
  return retryOperation(async () => {
    try {
      const result = await db.collection('tasks').updateOne(
        { _id: new ObjectId(id) },
        { $set: { completed: !completed } }
      );

      if (result.modifiedCount === 1) {
        return true;
      } else {
        console.error(`Task with id ${id} not found or update failed`);
        return false;
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      return false;
    }
  });
}

// Delete Task
export async function deleteTask(id: string) {
  try {
    const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error(`No task found with id ${id}`);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
}
