import type { User } from './User';
import type { Session } from './Session';

export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    session: Session;
  };
  message?: string;
  errorCode?: string;
}
