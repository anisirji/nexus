import { GmailService } from './gmail.service';
import { CalendarService } from './calendar.service';
import { DriveService } from './drive.service';
import { TasksService } from './tasks.service';
import { FormsService } from './forms.service';

export interface ServiceError {
  service: string;
  operation: string;
  error: string;
  timestamp: Date;
}

export class WorkspaceService {
  private gmail: GmailService;
  private calendar: CalendarService;
  private drive: DriveService;
  private tasks: TasksService;
  private forms: FormsService;
  private userId: string;
  private errors: ServiceError[] = [];

  constructor(userId: string) {
    this.userId = userId;
    this.gmail = new GmailService(userId);
    this.calendar = new CalendarService(userId);
    this.drive = new DriveService(userId);
    this.tasks = new TasksService(userId);
    this.forms = new FormsService(userId);
  }

  // Error handling wrapper
  private async withErrorHandling<T>(
    service: string,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const serviceError: ServiceError = {
        service,
        operation,
        error: errorMessage,
        timestamp: new Date(),
      };
      
      this.errors.push(serviceError);
      console.error(`[${service}] ${operation} failed:`, errorMessage);
      
      // Throw specific errors for auth issues
      if (errorMessage.includes('auth') || errorMessage.includes('token')) {
        throw new Error('Authentication failed. Please re-authenticate.');
      }
      
      // Return null for other errors
      return null;
    }
  }

  // Get recent errors
  getErrors() {
    return this.errors;
  }

  // Clear errors
  clearErrors() {
    this.errors = [];
  }

  // Gmail operations
  async searchEmails(query: string) {
    return this.withErrorHandling('Gmail', 'searchEmails', 
      () => this.gmail.searchMessages(query)
    );
  }

  async sendEmail(to: string, subject: string, body: string) {
    return this.withErrorHandling('Gmail', 'sendEmail',
      () => this.gmail.sendEmail(to, subject, body)
    );
  }

  async createDraft(to: string, subject: string, body: string) {
    return this.withErrorHandling('Gmail', 'createDraft',
      () => this.gmail.createDraft(to, subject, body)
    );
  }

  // Calendar operations
  async listEvents(timeMin?: Date, timeMax?: Date) {
    return this.withErrorHandling('Calendar', 'listEvents',
      () => this.calendar.listEvents(timeMin, timeMax)
    );
  }

  async createMeeting(
    title: string,
    description: string,
    startTime: Date,
    endTime: Date,
    attendees?: string[]
  ) {
    return this.withErrorHandling('Calendar', 'createMeeting',
      () => this.calendar.createEvent(title, description, startTime, endTime, attendees, true)
    );
  }

  async findAvailableSlots(duration: number, timeMin: Date, timeMax: Date) {
    return this.withErrorHandling('Calendar', 'findAvailableSlots',
      () => this.calendar.findAvailableSlots(duration, timeMin, timeMax)
    );
  }

  // Drive operations
  async searchFiles(query?: string) {
    return this.withErrorHandling('Drive', 'searchFiles',
      () => this.drive.searchFiles(query)
    );
  }

  async createDocument(name: string, content: string, folderId?: string) {
    return this.withErrorHandling('Drive', 'createDocument',
      () => this.drive.createFile(name, content, 'text/plain', folderId)
    );
  }

  async createFolder(name: string, parentId?: string) {
    return this.withErrorHandling('Drive', 'createFolder',
      () => this.drive.createFolder(name, parentId)
    );
  }

  // Tasks operations
  async listTasks(showCompleted: boolean = false) {
    return this.withErrorHandling('Tasks', 'listTasks',
      () => this.tasks.listTasks('@default', showCompleted)
    );
  }

  async createTask(title: string, notes?: string, due?: Date) {
    return this.withErrorHandling('Tasks', 'createTask',
      () => this.tasks.createTask(title, notes, due)
    );
  }

  async completeTask(taskId: string) {
    return this.withErrorHandling('Tasks', 'completeTask',
      () => this.tasks.completeTask(taskId)
    );
  }

  // Forms operations
  async createFeedbackForm(title: string, description: string) {
    return this.withErrorHandling('Forms', 'createFeedbackForm',
      () => this.forms.createFeedbackForm(title, description, [
        { question: 'How would you rate your experience?', type: 'rating' },
        { question: 'What did you like most?', type: 'text' },
        { question: 'What could be improved?', type: 'text' },
        { question: 'Would you recommend this to others?', type: 'multipleChoice', options: ['Yes', 'No', 'Maybe'] }
      ])
    );
  }

  async createSurvey(title: string, questions: Array<{ question: string; required: boolean }>) {
    return this.withErrorHandling('Forms', 'createSurvey',
      () => this.forms.createSurvey(title, questions)
    );
  }

  // Combined operations
  async scheduleInterviewWithForm(
    candidateName: string,
    candidateEmail: string,
    interviewerEmails: string[],
    startTime: Date,
    endTime: Date
  ) {
    const results = {
      event: null as any,
      form: null as any,
      email: null as any,
      errors: [] as string[],
    };

    // Create calendar event with Meet link
    const event = await this.createMeeting(
      `Interview with ${candidateName}`,
      `Interview scheduled with ${candidateName}`,
      startTime,
      endTime,
      [candidateEmail, ...interviewerEmails]
    );
    
    if (event) {
      results.event = event;
    } else {
      results.errors.push('Failed to create calendar event');
    }

    // Create feedback form
    const form = await this.createFeedbackForm(
      `Interview Feedback - ${candidateName}`,
      `Please provide feedback for the interview with ${candidateName}`
    );
    
    if (form) {
      results.form = form;
    } else {
      results.errors.push('Failed to create feedback form');
    }

    // Send email with details
    if (event && form) {
      const emailBody = `
        <h3>Interview Scheduled</h3>
        <p>Dear ${candidateName},</p>
        <p>Your interview has been scheduled for ${startTime.toLocaleString()}.</p>
        <p>Meeting Link: ${event.hangoutLink || 'Will be provided separately'}</p>
        <p>After the interview, please provide feedback using this form: 
        <a href="${form.publishedUrl}">Feedback Form</a></p>
        <p>Best regards,<br>The Hiring Team</p>
      `;

      const email = await this.sendEmail(
        candidateEmail,
        `Interview Scheduled - ${startTime.toLocaleDateString()}`,
        emailBody
      );
      
      if (email) {
        results.email = email;
      } else {
        results.errors.push('Failed to send email');
      }
    }

    return results;
  }

  // Daily briefing
  async getDailyBriefing(date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [events, tasks, emails] = await Promise.all([
      this.listEvents(startOfDay, endOfDay),
      this.listTasks(false),
      this.searchEmails(`after:${date.toISOString().split('T')[0]} is:unread`)
    ]);

    return {
      date: date.toDateString(),
      events: events || [],
      tasks: tasks || [],
      unreadEmails: emails || [],
      summary: {
        eventCount: events?.length || 0,
        taskCount: tasks?.length || 0,
        unreadCount: emails?.length || 0,
      }
    };
  }
}