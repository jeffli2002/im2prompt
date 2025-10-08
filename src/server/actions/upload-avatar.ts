'use server';

import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { getErrorMessage } from './error-messages';
import { uploadFile } from '@/lib/files/file-service';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import type { User } from 'better-auth/types';

const avatarErrorLogger = new ErrorLogger('upload-avatar');

export async function uploadAvatarAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  error?: string;
  fileInfo?: any;
}> {
  let session: { user?: User } | null = null;
  let file: File | null = null;
  
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      const errorMsg = await getErrorMessage('unauthorizedAccess');
      return { success: false, error: errorMsg };
    }

    file = formData.get('avatar') as File;

    if (!file) {
      const errorMsg = await getErrorMessage('fileNotFound');
      return { success: false, error: errorMsg };
    }

    if (!file.type.startsWith('image/')) {
      const errorMsg = await getErrorMessage('onlyImageFiles');
      return { success: false, error: errorMsg };
    }

    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = await getErrorMessage('fileSizeLimit');
      return { success: false, error: errorMsg };
    }

    // Use the unified file upload logic that saves to database
    const fileInfo = await uploadFile(file, session.user.id);

    return {
      success: true,
      url: fileInfo.url,
      fileInfo,
    };
  } catch (error) {
    avatarErrorLogger.logError(error as Error, {
      operation: 'uploadAvatar',
      userId: session?.user?.id,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });
    
    const errorMsg = error instanceof Error ? error.message : await getErrorMessage('fileUploadFailed');
    return { success: false, error: errorMsg };
  }
} 