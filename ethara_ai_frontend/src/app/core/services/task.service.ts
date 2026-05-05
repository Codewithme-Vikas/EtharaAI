import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface TaskPayload {
    task: TaskApi;
}

interface TasksPayload {
    tasks: TaskApi[];
}

interface UserApi {
    id?: string;
    _id?: string;
    name?: string;
    username?: string;
    email?: string;
}

interface ProjectRefApi {
    id?: string;
    _id?: string;
}

interface TaskApi {
    id?: string;
    _id?: string;
    title?: string;
    description?: string;
    dueDate?: string | null;
    priority?: string;
    status?: string;
    assignedUser?: UserApi | null;
    projectId?: string | ProjectRefApi;
}

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private readonly apiBaseUrl = `${environment.apiBaseUrl}/projects`;
    constructor(private readonly http: HttpClient) { }

    createTask(
        projectId: string,
        payload: {
            title: string;
            description?: string;
            dueDate?: string;
            priority?: string;
            assignedUserId: string;
        }
    ): Observable<Task> {
        return this.http
            .post<ApiResponse<TaskPayload>>(`${this.apiBaseUrl}/${projectId}/tasks`, payload)
            .pipe(map((response) => this.normalizeTask(response.data.task)));
    }

    getTasksByProject(projectId: string): Observable<Task[]> {
        return this.http
            .get<ApiResponse<TasksPayload>>(`${this.apiBaseUrl}/${projectId}/tasks`)
            .pipe(map((response) => response.data.tasks.map((task) => this.normalizeTask(task))));
    }

    updateTaskStatus(projectId: string, taskId: string, status: string): Observable<Task> {
        return this.http
            .patch<ApiResponse<TaskPayload>>(`${this.apiBaseUrl}/${projectId}/tasks/status`, { taskId, status })
            .pipe(map((response) => this.normalizeTask(response.data.task)));
    }

    assignTask(projectId: string, taskId: string, assignedUserId: string): Observable<Task> {
        return this.http
            .post<ApiResponse<TaskPayload>>(`${this.apiBaseUrl}/${projectId}/tasks/assign`, {
                taskId,
                assignedUserId
            })
            .pipe(map((response) => this.normalizeTask(response.data.task)));
    }

    private normalizeTask(task: TaskApi): Task {
        return {
            id: task.id ?? task._id ?? '',
            title: task.title ?? '',
            description: task.description ?? '',
            dueDate: task.dueDate ?? '',
            priority: task.priority ?? 'Medium',
            status: task.status ?? 'To Do',
            assignedUser: task.assignedUser ? this.normalizeUser(task.assignedUser) : null,
            projectId: this.normalizeProjectId(task.projectId)
        };
    }

    private normalizeUser(user: UserApi): User {
        return {
            id: user.id ?? user._id ?? '',
            name: user.name ?? user.username ?? 'Unknown User',
            email: user.email ?? ''
        };
    }

    private normalizeProjectId(projectId?: string | ProjectRefApi): string {
        if (!projectId) {
            return '';
        }

        return typeof projectId === 'string' ? projectId : projectId.id ?? projectId._id ?? '';
    }
}
