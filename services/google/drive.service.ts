import { google, drive_v3 } from 'googleapis';
import { getGoogleOAuthClient } from '@/lib/google/oauth-client';
import { Readable } from 'stream';

export class DriveService {
  private drive!: drive_v3.Drive;
  private userId: string;
  private initialized = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async initialize() {
    if (!this.initialized) {
      const auth = await getGoogleOAuthClient(this.userId);
      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;
    }
  }

  // Search files
  async searchFiles(query?: string, mimeType?: string) {
    await this.initialize();
    
    try {
      let q = '';
      if (query) {
        q = `fullText contains '${query}'`;
      }
      if (mimeType) {
        q += q ? ` and mimeType='${mimeType}'` : `mimeType='${mimeType}'`;
      }

      const response = await this.drive.files.list({
        q: q || undefined,
        fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 20,
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error searching files:', error);
      throw new Error('Failed to search files');
    }
  }

  // Read file content
  async readFile(fileId: string) {
    await this.initialize();
    
    try {
      // Get file metadata first
      const metadataResponse = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType',
      });

      const mimeType = metadataResponse.data.mimeType;

      // Export Google Docs/Sheets/Slides to readable format
      if (mimeType?.startsWith('application/vnd.google-apps')) {
        let exportMimeType = 'text/plain';
        
        if (mimeType.includes('document')) {
          exportMimeType = 'text/plain';
        } else if (mimeType.includes('spreadsheet')) {
          exportMimeType = 'text/csv';
        } else if (mimeType.includes('presentation')) {
          exportMimeType = 'text/plain';
        }

        const response = await this.drive.files.export({
          fileId,
          mimeType: exportMimeType,
        }, { responseType: 'text' });

        return {
          ...metadataResponse.data,
          content: response.data,
        };
      } else {
        // For regular files, get the content
        const response = await this.drive.files.get({
          fileId,
          alt: 'media',
        }, { responseType: 'text' });

        return {
          ...metadataResponse.data,
          content: response.data,
        };
      }
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read file');
    }
  }

  // Create file
  async createFile(
    name: string,
    content: string,
    mimeType: string = 'text/plain',
    folderId?: string
  ) {
    await this.initialize();
    
    try {
      const fileMetadata: drive_v3.Schema$File = {
        name,
        parents: folderId ? [folderId] : undefined,
      };

      const media = {
        mimeType,
        body: Readable.from([content]),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, webViewLink',
      });

      return response.data;
    } catch (error) {
      console.error('Error creating file:', error);
      throw new Error('Failed to create file');
    }
  }

  // Create folder
  async createFolder(name: string, parentFolderId?: string) {
    await this.initialize();
    
    try {
      const fileMetadata: drive_v3.Schema$File = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, webViewLink',
      });

      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create folder');
    }
  }

  // Update file
  async updateFile(fileId: string, content: string, mimeType: string = 'text/plain') {
    await this.initialize();
    
    try {
      const media = {
        mimeType,
        body: Readable.from([content]),
      };

      const response = await this.drive.files.update({
        fileId,
        media,
        fields: 'id, name, modifiedTime',
      });

      return response.data;
    } catch (error) {
      console.error('Error updating file:', error);
      throw new Error('Failed to update file');
    }
  }

  // Delete file
  async deleteFile(fileId: string) {
    await this.initialize();
    
    try {
      await this.drive.files.delete({
        fileId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Share file
  async shareFile(fileId: string, email: string, role: 'reader' | 'writer' = 'reader') {
    await this.initialize();
    
    try {
      const response = await this.drive.permissions.create({
        fileId,
        requestBody: {
          type: 'user',
          role,
          emailAddress: email,
        },
        sendNotificationEmail: true,
      });

      return response.data;
    } catch (error) {
      console.error('Error sharing file:', error);
      throw new Error('Failed to share file');
    }
  }
}