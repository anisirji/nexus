import { google, tasks_v1 } from 'googleapis';
import { getGoogleOAuthClient } from '@/lib/google/oauth-client';

export class TasksService {
  private tasks!: tasks_v1.Tasks;
  private userId: string;
  private initialized = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async initialize() {
    if (!this.initialized) {
      const auth = await getGoogleOAuthClient(this.userId);
      this.tasks = google.tasks({ version: 'v1', auth });
      this.initialized = true;
    }
  }

  // List task lists
  async listTaskLists() {
    await this.initialize();
    
    try {
      const response = await this.tasks.tasklists.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error listing task lists:', error);
      throw new Error('Failed to list task lists');
    }
  }

  // Create task list
  async createTaskList(title: string) {
    await this.initialize();
    
    try {
      const response = await this.tasks.tasklists.insert({
        requestBody: {
          title,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating task list:', error);
      throw new Error('Failed to create task list');
    }
  }

  // List tasks
  async listTasks(taskListId: string = '@default', showCompleted: boolean = false) {
    await this.initialize();
    
    try {
      const response = await this.tasks.tasks.list({
        tasklist: taskListId,
        showCompleted,
        showHidden: false,
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error listing tasks:', error);
      throw new Error('Failed to list tasks');
    }
  }

  // Create task
  async createTask(
    title: string,
    notes?: string,
    due?: Date,
    taskListId: string = '@default'
  ) {
    await this.initialize();
    
    try {
      const task: tasks_v1.Schema$Task = {
        title,
        notes,
      };

      if (due) {
        // Google Tasks API expects RFC 3339 timestamp
        task.due = due.toISOString().split('.')[0] + 'Z';
      }

      const response = await this.tasks.tasks.insert({
        tasklist: taskListId,
        requestBody: task,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  // Update task
  async updateTask(
    taskId: string,
    updates: {
      title?: string;
      notes?: string;
      due?: Date | null;
      status?: 'needsAction' | 'completed';
    },
    taskListId: string = '@default'
  ) {
    await this.initialize();
    
    try {
      const task: tasks_v1.Schema$Task = {};

      if (updates.title !== undefined) task.title = updates.title;
      if (updates.notes !== undefined) task.notes = updates.notes;
      if (updates.status !== undefined) task.status = updates.status;
      
      if (updates.due !== undefined) {
        if (updates.due === null) {
          task.due = null;
        } else {
          task.due = updates.due.toISOString().split('.')[0] + 'Z';
        }
      }

      const response = await this.tasks.tasks.patch({
        tasklist: taskListId,
        task: taskId,
        requestBody: task,
      });

      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  // Complete task
  async completeTask(taskId: string, taskListId: string = '@default') {
    return this.updateTask(taskId, { status: 'completed' }, taskListId);
  }

  // Delete task
  async deleteTask(taskId: string, taskListId: string = '@default') {
    await this.initialize();
    
    try {
      await this.tasks.tasks.delete({
        tasklist: taskListId,
        task: taskId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  // Move task to different list
  async moveTask(
    taskId: string,
    fromListId: string,
    toListId: string
  ) {
    await this.initialize();
    
    try {
      const response = await this.tasks.tasks.move({
        tasklist: fromListId,
        task: taskId,
        destinationTasklist: toListId,
      });

      return response.data;
    } catch (error) {
      console.error('Error moving task:', error);
      throw new Error('Failed to move task');
    }
  }

  // Set reminder (Note: Google Tasks API doesn't directly support reminders,
  // but we can use due dates as a workaround)
  async setTaskReminder(
    taskId: string,
    reminderDate: Date,
    taskListId: string = '@default'
  ) {
    return this.updateTask(
      taskId,
      { due: reminderDate },
      taskListId
    );
  }
}