import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getGoogleOAuthClient(userId?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Get the current user's tokens from the database
  let currentUserId = userId;
  
  if (!currentUserId) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('No authenticated user found');
    }
    currentUserId = session.user.id;
  }

  // Get the user's account with tokens
  const account = await prisma.account.findFirst({
    where: {
      userId: currentUserId,
      provider: 'google',
    },
  });

  if (!account) {
    throw new Error('No Google account linked for this user');
  }

  // Set the credentials
  oauth2Client.setCredentials({
    access_token: account.access_token || undefined,
    refresh_token: account.refresh_token || undefined,
    scope: account.scope || undefined,
    token_type: account.token_type || undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Handle token refresh
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: account.providerAccountId,
          },
        },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
        },
      });
    }
  });

  return oauth2Client;
}