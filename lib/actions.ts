'use server';
import { db } from './db';
import { ObjectId } from 'mongodb';


export async function getTasks() {
  const tasks = await db.collection('tasks').find().toArray();
  return tasks.map(task => ({
    ...task,
    _id: task._id.toString(),
  }));
}

export async function addTask(title: string, description: string, dueDate: string) {
  await db.collection('tasks').insertOne({ title, description, dueDate, completed: false });
}


export async function toggleTask(id: string, completed: boolean): Promise<boolean> {
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
  } catch (error) {
    console.error('Error toggling task:', error);
    return false; 
  }
}


export async function deleteTask(id: string) {
  await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
}
