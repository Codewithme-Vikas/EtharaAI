import { User } from './user.model';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  assignedUser: User | null;
  projectId: string;
}
