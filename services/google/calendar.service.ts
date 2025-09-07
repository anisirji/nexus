import { google, calendar_v3 } from 'googleapis';
import { getGoogleOAuthClient } from '@/lib/google/oauth-client';

export class CalendarService {
  private calendar!: calendar_v3.Calendar;
  private userId: string;
  private initialized = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async initialize() {
    if (!this.initialized) {
      const auth = await getGoogleOAuthClient(this.userId);
      this.calendar = google.calendar({ version: 'v3', auth });
      this.initialized = true;
    }
  }

  // List events
  async listEvents(timeMin?: Date, timeMax?: Date, calendarId: string = 'primary') {
    await this.initialize();
    
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin?.toISOString(),
        timeMax: timeMax?.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error listing events:', error);
      throw new Error('Failed to list events');
    }
  }

  // Create event with automatic Meet link
  async createEvent(
    summary: string,
    description: string,
    startTime: Date,
    endTime: Date,
    attendees?: string[],
    addMeetLink: boolean = true,
    calendarId: string = 'primary'
  ) {
    await this.initialize();
    
    try {
      const event: calendar_v3.Schema$Event = {
        summary,
        description,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: attendees?.map(email => ({ email })),
      };

      // Add Google Meet link
      if (addMeetLink) {
        event.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      }

      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
        conferenceDataVersion: addMeetLink ? 1 : 0,
        sendUpdates: 'all',
      });

      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  // Update event
  async updateEvent(
    eventId: string,
    updates: Partial<calendar_v3.Schema$Event>,
    calendarId: string = 'primary'
  ) {
    await this.initialize();
    
    try {
      const response = await this.calendar.events.patch({
        calendarId,
        eventId,
        requestBody: updates,
        sendUpdates: 'all',
      });

      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  // Check availability (find free/busy times)
  async checkAvailability(
    timeMin: Date,
    timeMax: Date,
    calendars?: string[]
  ) {
    await this.initialize();
    
    try {
      const calendarIds = calendars || ['primary'];
      
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: calendarIds.map(id => ({ id })),
        },
      });

      return response.data.calendars || {};
    } catch (error) {
      console.error('Error checking availability:', error);
      throw new Error('Failed to check availability');
    }
  }

  // Find available meeting slots
  async findAvailableSlots(
    duration: number, // in minutes
    timeMin: Date,
    timeMax: Date,
    calendars?: string[]
  ) {
    const busyTimes = await this.checkAvailability(timeMin, timeMax, calendars);
    const availableSlots: Array<{ start: Date; end: Date }> = [];
    
    // Parse busy times for primary calendar
    const primaryBusy = busyTimes['primary']?.busy || [];
    
    // Sort busy times by start
    primaryBusy.sort((a, b) => 
      new Date(a.start!).getTime() - new Date(b.start!).getTime()
    );

    let currentTime = new Date(timeMin);
    const endTime = new Date(timeMax);

    for (const busy of primaryBusy) {
      const busyStart = new Date(busy.start!);
      
      // Check if there's a gap before this busy period
      if (busyStart.getTime() - currentTime.getTime() >= duration * 60 * 1000) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(Math.min(
            currentTime.getTime() + duration * 60 * 1000,
            busyStart.getTime()
          )),
        });
      }
      
      currentTime = new Date(busy.end!);
    }

    // Check for remaining time after last busy period
    if (endTime.getTime() - currentTime.getTime() >= duration * 60 * 1000) {
      availableSlots.push({
        start: new Date(currentTime),
        end: new Date(currentTime.getTime() + duration * 60 * 1000),
      });
    }

    return availableSlots;
  }

  // Delete event
  async deleteEvent(eventId: string, calendarId: string = 'primary') {
    await this.initialize();
    
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all',
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }
}