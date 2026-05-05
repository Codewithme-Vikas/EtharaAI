import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface ProjectPayload {
    project: ProjectApi;
}

interface ProjectsPayload {
    projects: ProjectApi[];
}

interface UsersPayload {
    users: UserApi[];
}

interface UserApi {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
}

interface ProjectApi {
    id?: string;
    _id?: string;
    name?: string;
    title?: string;
    description?: string;
    creator?: UserApi;
    members?: UserApi[];
}

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private readonly apiUrl = `${environment.apiBaseUrl}/projects`;

    constructor(private readonly http: HttpClient) { }

    createProject(name: string, description: string, memberIds: string[] = []): Observable<Project> {
        return this.http
            .post<ApiResponse<ProjectPayload>>(this.apiUrl, {
                title: name,
                description,
                members: memberIds
            })
            .pipe(map((response) => this.normalizeProject(response.data.project)));
    }

    getProjects(): Observable<Project[]> {
        return this.http
            .get<ApiResponse<ProjectsPayload>>(this.apiUrl)
            .pipe(map((response) => response.data.projects.map((project) => this.normalizeProject(project))));
    }

    addMember(projectId: string, email: string): Observable<Project> {
        return this.http
            .post<ApiResponse<ProjectPayload>>(`${this.apiUrl}/${projectId}/members`, { email })
            .pipe(map((response) => this.normalizeProject(response.data.project)));
    }

    removeMember(projectId: string, memberId: string): Observable<Project> {
        return this.http
            .delete<ApiResponse<ProjectPayload>>(`${this.apiUrl}/${projectId}/members/${memberId}`)
            .pipe(map((response) => this.normalizeProject(response.data.project)));
    }

    // To Do: create seprate service named user.service.ts
    getAllUsers(): Observable<User[]> {
        return this.http
            .get<ApiResponse<UsersPayload>>(`${this.apiUrl}/fetchAllUsers`)
            .pipe(map((response) => response.data.users.map((user) => this.normalizeUser(user))));
    }

    private normalizeProject(project: ProjectApi): Project {
        return {
            id: project.id ?? project._id ?? '',
            name: project.name ?? project.title ?? 'Untitled Project',
            description: project.description ?? '',
            creator: this.normalizeUser(project.creator),
            members: (project.members ?? []).map((member) => this.normalizeUser(member))
        };
    }

    private normalizeUser(user?: UserApi): User {
        return {
            id: user?.id ?? user?._id ?? '',
            name: user?.name ?? 'Unknown User',
            email: user?.email ?? ''
        };
    }
}
