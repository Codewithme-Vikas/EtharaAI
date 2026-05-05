import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface DashboardApiData {
    totalTasks?: number;
    tasksByStatus?: {
        'To Do'?: number;
        'In Progress'?: number;
        Done?: number;
    };
    overdueTasks?: number;
}

export interface DashboardStats {
    totalTasks: number;
    tasksByStatus: {
        toDo: number;
        inProgress: number;
        done: number;
    };
    overdueTasks: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly apiUrl = `${environment.apiBaseUrl}/dashboard`;
    constructor(private readonly http: HttpClient) { }

    getDashboardStats(): Observable<DashboardStats> {
        return this.http
            .get<ApiResponse<DashboardApiData>>(this.apiUrl)
            .pipe(map((response) => this.normalizeDashboardStats(response.data)));
    }

    private normalizeDashboardStats(data?: DashboardApiData): DashboardStats {
        return {
            totalTasks: data?.totalTasks ?? 0,
            tasksByStatus: {
                toDo: data?.tasksByStatus?.['To Do'] ?? 0,
                inProgress: data?.tasksByStatus?.['In Progress'] ?? 0,
                done: data?.tasksByStatus?.Done ?? 0
            },
            overdueTasks: data?.overdueTasks ?? 0
        };
    }
}
