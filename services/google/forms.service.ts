import { google, forms_v1 } from 'googleapis';
import { getGoogleOAuthClient } from '@/lib/google/oauth-client';

export class FormsService {
  private forms!: forms_v1.Forms;
  private userId: string;
  private initialized = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async initialize() {
    if (!this.initialized) {
      const auth = await getGoogleOAuthClient(this.userId);
      this.forms = google.forms({ version: 'v1', auth });
      this.initialized = true;
    }
  }

  // Create a basic form
  async createForm(title: string, description?: string) {
    await this.initialize();
    
    try {
      const response = await this.forms.forms.create({
        requestBody: {
          info: {
            title,
            documentTitle: title,
            description,
          },
        },
      });

      return {
        ...response.data,
        editUrl: `https://docs.google.com/forms/d/${response.data.formId}/edit`,
        publishedUrl: `https://docs.google.com/forms/d/e/${response.data.formId}/viewform`,
      };
    } catch (error) {
      console.error('Error creating form:', error);
      throw new Error('Failed to create form');
    }
  }

  // Get form details
  async getForm(formId: string) {
    await this.initialize();
    
    try {
      const response = await this.forms.forms.get({
        formId,
      });

      return {
        ...response.data,
        editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
        publishedUrl: `https://docs.google.com/forms/d/e/${formId}/viewform`,
      };
    } catch (error) {
      console.error('Error getting form:', error);
      throw new Error('Failed to get form');
    }
  }

  // Add question to form
  async addQuestion(
    formId: string,
    question: {
      title: string;
      description?: string;
      type: 'SHORT_ANSWER' | 'PARAGRAPH' | 'MULTIPLE_CHOICE' | 'CHECKBOX' | 'DROPDOWN';
      required?: boolean;
      options?: string[];
    }
  ) {
    await this.initialize();
    
    try {
      const item: forms_v1.Schema$Item = {
        title: question.title,
        description: question.description,
        questionItem: {
          question: {
            required: question.required || false,
          },
        },
      };

      // Set question type
      switch (question.type) {
        case 'SHORT_ANSWER':
          item.questionItem!.question!.textQuestion = {
            paragraph: false,
          };
          break;
        case 'PARAGRAPH':
          item.questionItem!.question!.textQuestion = {
            paragraph: true,
          };
          break;
        case 'MULTIPLE_CHOICE':
          item.questionItem!.question!.choiceQuestion = {
            type: 'RADIO',
            options: question.options?.map(text => ({ value: text })) || [],
          };
          break;
        case 'CHECKBOX':
          item.questionItem!.question!.choiceQuestion = {
            type: 'CHECKBOX',
            options: question.options?.map(text => ({ value: text })) || [],
          };
          break;
        case 'DROPDOWN':
          item.questionItem!.question!.choiceQuestion = {
            type: 'DROP_DOWN',
            options: question.options?.map(text => ({ value: text })) || [],
          };
          break;
      }

      const response = await this.forms.forms.batchUpdate({
        formId,
        requestBody: {
          requests: [
            {
              createItem: {
                item,
                location: { index: 0 },
              },
            },
          ],
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error adding question:', error);
      throw new Error('Failed to add question');
    }
  }

  // Create feedback form template
  async createFeedbackForm(
    title: string,
    description: string,
    questions: Array<{
      question: string;
      type: 'rating' | 'text' | 'multipleChoice';
      options?: string[];
    }>
  ) {
    await this.initialize();
    
    try {
      // Create the form
      const form = await this.createForm(title, description);
      
      // Add questions
      for (const q of questions) {
        let questionType: 'SHORT_ANSWER' | 'PARAGRAPH' | 'MULTIPLE_CHOICE' = 'SHORT_ANSWER';
        let options: string[] | undefined;

        switch (q.type) {
          case 'rating':
            questionType = 'MULTIPLE_CHOICE';
            options = ['1 - Very Poor', '2 - Poor', '3 - Average', '4 - Good', '5 - Excellent'];
            break;
          case 'text':
            questionType = 'PARAGRAPH';
            break;
          case 'multipleChoice':
            questionType = 'MULTIPLE_CHOICE';
            options = q.options;
            break;
        }

        await this.addQuestion(form.formId!, {
          title: q.question,
          type: questionType,
          required: true,
          options,
        });
      }

      return form;
    } catch (error) {
      console.error('Error creating feedback form:', error);
      throw new Error('Failed to create feedback form');
    }
  }

  // Create survey template
  async createSurvey(
    title: string,
    questions: Array<{
      question: string;
      required: boolean;
    }>
  ) {
    await this.initialize();
    
    try {
      const form = await this.createForm(title, 'Please take a moment to complete this survey');
      
      for (const q of questions) {
        await this.addQuestion(form.formId!, {
          title: q.question,
          type: 'SHORT_ANSWER',
          required: q.required,
        });
      }

      return form;
    } catch (error) {
      console.error('Error creating survey:', error);
      throw new Error('Failed to create survey');
    }
  }

  // Get form responses
  async getResponses(formId: string) {
    await this.initialize();
    
    try {
      const response = await this.forms.forms.responses.list({
        formId,
      });

      return response.data.responses || [];
    } catch (error) {
      console.error('Error getting responses:', error);
      throw new Error('Failed to get form responses');
    }
  }
}