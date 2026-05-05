import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { DashboardService, DashboardStats } from '../../../../core/services/dashboard.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, LoaderComponent, NavbarComponent],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    protected readonly stats = signal<DashboardStats>({
        totalTasks: 0,
        tasksByStatus: {
            toDo: 0,
            inProgress: 0,
            done: 0
        },
        overdueTasks: 0
    });
    protected readonly isLoading = signal(false);
    protected readonly errorMessage = signal('');

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        this.loadDashboardStats();
    }

    private loadDashboardStats(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');

        this.dashboardService.getDashboardStats().subscribe({
            next: (stats) => {
                this.stats.set(stats);
                this.isLoading.set(false);
            },
            error: () => {
                this.errorMessage.set('Failed to load dashboard data.');
                this.isLoading.set(false);
            }
        });
    }

    protected retryLoad(): void {
        this.loadDashboardStats();
    }


}
