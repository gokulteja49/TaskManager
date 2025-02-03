'use server';
import { db } from './db';
import { ObjectId } from 'mongodb';

// Define a type for the retry operation to make it more specific.
const retryOperation = async <T>(operation: () => Promise<T>, retries: number = 3): Promise<T> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await operation();
    } catch {
      attempt++;
      console.error(`Retrying operation, attempt ${attempt}...`);
      if (attempt === retries) {
        throw new Error('Operation failed after multiple retries');
      }
    }
  }
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
      _id: task._id.toString(),
    }));
  } catch {
    console.error('Error fetching tasks');
    throw new Error('Failed to fetch tasks');
  }
}

// Add Task
export async function addTask(title: string, description: string, dueDate: string) {
  try {
    await db.collection('tasks').insertOne({ title, description, dueDate, completed: false });
  } catch {
    console.error('Error adding task');
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
        console.error('No task found or update failed');
        return false;
      }
    } catch {
      console.error('Error toggling task');
      return false;
    }
  });
}

// Delete Task
export async function deleteTask(id: string) {
  try {
    await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
  } catch {
    console.error('Error deleting task');
    throw new Error('Failed to delete task');
  }
}
