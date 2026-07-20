export interface EmailJobData {
  to: string;
  subject: string;
  text: string;
}

export const EMAIL_QUEUE = 'email';
