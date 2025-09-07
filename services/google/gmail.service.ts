import { google, gmail_v1 } from 'googleapis';
import { getGoogleOAuthClient } from '@/lib/google/oauth-client';

export class GmailService {
  private gmail!: gmail_v1.Gmail;
  private userId: string;
  private initialized = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async initialize() {
    if (!this.initialized) {
      const auth = await getGoogleOAuthClient(this.userId);
      this.gmail = google.gmail({ version: 'v1', auth });
      this.initialized = true;
    }
  }

  // Read emails
  async listMessages(query?: string, maxResults: number = 10) {
    await this.initialize();
    
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      const messages = response.data.messages || [];
      
      // Get full message details
      const fullMessages = await Promise.all(
        messages.map(msg => this.getMessage(msg.id!))
      );

      return fullMessages;
    } catch (error) {
      console.error('Error listing messages:', error);
      throw new Error('Failed to list messages');
    }
  }

  // Get single message
  async getMessage(messageId: string) {
    await this.initialize();
    
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      return this.parseMessage(response.data);
    } catch (error) {
      console.error('Error getting message:', error);
      throw new Error('Failed to get message');
    }
  }

  // Search emails
  async searchMessages(query: string) {
    return this.listMessages(query);
  }

  // Send email
  async sendEmail(to: string, subject: string, body: string, attachments?: any[]) {
    await this.initialize();
    
    try {
      const message = this.createMessage(to, subject, body, attachments);
      
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Create draft
  async createDraft(to: string, subject: string, body: string, attachments?: any[]) {
    await this.initialize();
    
    try {
      const message = this.createMessage(to, subject, body, attachments);
      
      const response = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: message,
          },
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating draft:', error);
      throw new Error('Failed to create draft');
    }
  }

  // Helper to create email message
  private createMessage(to: string, subject: string, body: string, attachments?: any[]) {
    const boundary = '----boundary----';
    let message = '';

    if (attachments && attachments.length > 0) {
      // Multipart message with attachments
      message = [
        'Content-Type: multipart/mixed; boundary=' + boundary,
        'MIME-Version: 1.0',
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'MIME-Version: 1.0',
        'Content-Transfer-Encoding: 7bit',
        '',
        body,
        '',
      ].join('\r\n');

      // Add attachments
      for (const attachment of attachments) {
        message += [
          `--${boundary}`,
          `Content-Type: ${attachment.mimeType}`,
          'MIME-Version: 1.0',
          'Content-Transfer-Encoding: base64',
          `Content-Disposition: attachment; filename="${attachment.filename}"`,
          '',
          attachment.content,
          '',
        ].join('\r\n');
      }

      message += `--${boundary}--`;
    } else {
      // Simple message without attachments
      message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=UTF-8',
        '',
        body,
      ].join('\r\n');
    }

    // Encode message to base64
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Parse message data
  private parseMessage(message: gmail_v1.Schema$Message) {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => 
      headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    let body = '';
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString();
    } else if (message.payload?.parts) {
      const textPart = message.payload.parts.find(
        part => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      from: getHeader('from'),
      to: getHeader('to'),
      subject: getHeader('subject'),
      date: getHeader('date'),
      body,
      snippet: message.snippet,
    };
  }
}